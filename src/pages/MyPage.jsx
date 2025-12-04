import React, { useEffect, useRef, useState } from 'react';
import { FaPen } from 'react-icons/fa';
import './MyPage.css';

const DEFAULT_NICKNAME = 'hyexnzzi';
const SERVER_URL = '';

const MemberAPI = {
  async getMemberProfile(signal) {
    const response = await fetch(`${SERVER_URL}/api/members/me`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      signal,
    });

    if (!response.ok) {
      throw new Error('프로필 정보를 불러오지 못했습니다.');
    }

    return response.json();
  },

  async updateMemberProfile(updateRequestDto) {
    const response = await fetch(`${SERVER_URL}/api/members/me`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updateRequestDto),
    });

    if (!response.ok) {
      let message = '닉네임을 저장하지 못했습니다.';
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorDto = await response.json();
          if (errorDto?.message) {
            message = errorDto.message;
          }
        } else {
          const errorText = await response.text();
          console.error('서버가 JSON이 아닌 오류를 반환했습니다:', errorText);
          message = `서버 오류 발생 (${response.status})`;
        }
      } catch (error) {
        console.error('오류 응답 처리 중 예외가 발생했습니다:', error);
      }
      throw new Error(message);
    }

    return response.json();
  },

  async getMyCourses(signal) {
    const response = await fetch(`${SERVER_URL}/api/members/me/courses`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      signal,
    });

    if (!response.ok) {
      throw new Error('나의 빵지순례 목록을 불러오지 못했습니다.');
    }

    return response.json();
  },
};

function MyPage() {
  const mapRef = useRef(null);
  const [mapError, setMapError] = useState(null);
  const [nickname, setNickname] = useState(DEFAULT_NICKNAME);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [tempNickname, setTempNickname] = useState(DEFAULT_NICKNAME);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [nicknameError, setNicknameError] = useState(null);
  const [isSavingNickname, setIsSavingNickname] = useState(false);
  const [myCourses, setMyCourses] = useState([]);
  const [myCoursesLoading, setMyCoursesLoading] = useState(true);
  const [myCoursesError, setMyCoursesError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        setProfileError(null);

        const profileResponseDto = await MemberAPI.getMemberProfile(controller.signal);
        const nextNickname = profileResponseDto?.nickname ?? DEFAULT_NICKNAME;
        setNickname(nextNickname);
        setTempNickname(nextNickname);
      } catch (error) {
        if (error.name === 'AbortError') return;
        setProfileError(error.message);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchMyCourses = async () => {
      try {
        setMyCoursesLoading(true);
        setMyCoursesError(null);

        const myCoursesDtoList = await MemberAPI.getMyCourses(controller.signal);
        setMyCourses(Array.isArray(myCoursesDtoList) ? myCoursesDtoList : []);
      } catch (error) {
        if (error.name === 'AbortError') return;
        setMyCoursesError(error.message);
      } finally {
        setMyCoursesLoading(false);
      }
    };

    fetchMyCourses();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const loadMap = () => {
      if (!window.kakao || !window.kakao.maps || !mapRef.current) {
        setMapError('카카오 지도 객체를 불러오지 못했습니다.');
        return;
      }

      const center = new window.kakao.maps.LatLng(37.5665, 126.9780); // 서울 시청 근처 예시
      const options = {
        center,
        level: 5,
      };

      // eslint-disable-next-line no-new
      new window.kakao.maps.Map(mapRef.current, options);

      setMapError(null);
    };

    if (!import.meta.env.VITE_KAKAO_MAP_KEY) {
      setMapError('.env 파일에 VITE_KAKAO_MAP_KEY가 설정되어 있는지 확인해주세요.');
      return;
    }

    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(loadMap);
      return;
    }

    const existingScript = document.querySelector('script[data-kakao-maps]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        window.kakao.maps.load(loadMap);
      });
      return;
    }

    const script = document.createElement('script');
    const kakaoSdkUrl = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_KEY}&autoload=false`;
    script.src = kakaoSdkUrl;
    script.async = true;
    script.dataset.kakaoMaps = 'true';
    script.onload = () => {
      window.kakao.maps.load(loadMap);
    };
    script.onerror = () => {
      setMapError('카카오 지도 스크립트를 불러오지 못했습니다. 네트워크 상태와 앱 키를 확인해주세요.');
    };
    document.head.appendChild(script);
  }, []);

  const handleNicknameEdit = () => {
    setTempNickname(nickname);
    setNicknameError(null);
    setIsEditingNickname(true);
  };

  const handleNicknameCancel = () => {
    setIsEditingNickname(false);
    setNicknameError(null);
    setTempNickname(nickname);
  };

  const handleNicknameSave = async () => {
    const trimmed = tempNickname.trim();
    if (!trimmed) {
      setNicknameError('닉네임을 입력해주세요.');
      return;
    }

    try {
      setIsSavingNickname(true);
      setNicknameError(null);

      const updateRequestDto = { nickname: trimmed };
      const updatedProfileDto = await MemberAPI.updateMemberProfile(updateRequestDto);
      const updatedNickname = updatedProfileDto?.nickname ?? trimmed;

      setNickname(updatedNickname);
      setTempNickname(updatedNickname);
      setProfileError(null);
      setIsEditingNickname(false);
    } catch (error) {
      setNicknameError(error.message);
    } finally {
      setIsSavingNickname(false);
    }
  };

  return (
    <div className="mypage-container">
      <div className="mypage-inner">
        {/* 왼쪽 마이페이지 정보 영역 */}
        <section className="mypage-left">
          <div className="mypage-profile-card">
            <div className="mypage-profile-avatar" aria-hidden="true">
              <div className="mypage-profile-avatar-initial">
                {nickname?.[0]?.toUpperCase() || 'B'}
              </div>
            </div>
            <div className="mypage-profile-body">
              <div className="mypage-profile-nameblock">
                {profileLoading ? (
                  <div className="mypage-inline-status">프로필을 불러오는 중...</div>
                ) : isEditingNickname ? (
                  <>
                    <input
                      type="text"
                      className="mypage-nickname-input"
                      value={tempNickname}
                      onChange={(e) => setTempNickname(e.target.value)}
                      maxLength={20}
                      placeholder="닉네임을 입력하세요"
                    />
                    <div className="mypage-nickname-buttons">
                      <button
                        type="button"
                        className="mypage-save-button"
                        onClick={handleNicknameSave}
                        disabled={!tempNickname.trim() || isSavingNickname}
                      >
                        {isSavingNickname ? '저장 중...' : '저장'}
                      </button>
                      <button
                        type="button"
                        className="mypage-cancel-button"
                        onClick={handleNicknameCancel}
                        disabled={isSavingNickname}
                      >
                        취소
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="mypage-name-display">
                    <span className="mypage-profile-nickname">{nickname}</span>
                  </div>
                )}
              </div>
              {nicknameError && <p className="mypage-inline-error">{nicknameError}</p>}
              {profileError && !isEditingNickname && (
                <p className="mypage-inline-error">{profileError}</p>
              )}
              {!isEditingNickname && !profileLoading && (
                <button
                  type="button"
                  className="mypage-edit-button"
                  onClick={handleNicknameEdit}
                  disabled={profileLoading}
                >
                  <FaPen aria-hidden="true" />
                  프로필 수정
                </button>
              )}
            </div>
          </div>

          <div className="mypage-list-card">
            <div className="mypage-list-header">내가 작성한 빵지순례 목록</div>
            {myCoursesLoading && (
              <p className="mypage-inline-status">내 빵지순례를 불러오는 중...</p>
            )}
            {myCoursesError && !myCoursesLoading && (
              <p className="mypage-inline-error">{myCoursesError}</p>
            )}
            {!myCoursesLoading && !myCoursesError && myCourses.length === 0 && (
              <p className="mypage-inline-status">아직 작성한 빵지순례가 없습니다.</p>
            )}
            {!myCoursesLoading && !myCoursesError && myCourses.length > 0 && (
              <ul className="mypage-course-list">
                {myCourses.map((courseDto) => (
                  <li className="mypage-list-item" key={courseDto.course_id}>
                    <div className="mypage-list-thumb">
                      {courseDto.photo ? (
                        <img src={courseDto.photo} alt={courseDto.title} />
                      ) : (
                        <span className="mypage-thumb-placeholder">BC</span>
                      )}
                    </div>
                    <div className="mypage-list-text">
                      <div className="mypage-list-title">{courseDto.title}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* 오른쪽 지도 영역 */}
        <section className="mypage-right">
          <div className="mypage-map" ref={mapRef}>
            {mapError && <div className="mypage-map-error">{mapError}</div>}
          </div>
        </section>
      </div>
    </div>
  );
}

export default MyPage;


