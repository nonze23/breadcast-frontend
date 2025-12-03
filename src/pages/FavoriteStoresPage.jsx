import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FavoriteStoresPage.css';

function FavoriteStoresPage() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [mapError, setMapError] = useState(null);
  const [favoriteBakeries, setFavoriteBakeries] = useState([]);
  const [favoriteBakeriesLoading, setFavoriteBakeriesLoading] = useState(true);
  const [favoriteBakeriesError, setFavoriteBakeriesError] = useState(null);
  const mapInstance = useRef(null);
  const markers = useRef([]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchFavoriteBakeries = async () => {
      try {
        setFavoriteBakeriesLoading(true);
        setFavoriteBakeriesError(null);
        
        const response = await fetch('http://43.200.233.19/api/members/me/favorites/bakeries', {
          method: 'GET',
          credentials: 'include',
          signal: controller.signal,
        });

        if (!response.ok) {
          // 500 에러 등 서버 에러의 경우 응답 본문에서 에러 메시지 추출 시도
          let errorMessage = '즐겨찾기 가게 목록을 불러오지 못했습니다.';
          try {
            const errorData = await response.json();
            if (errorData?.message) {
              errorMessage = errorData.message;
            } else if (errorData?.error) {
              errorMessage = errorData.error;
            }
          } catch (e) {
            // JSON 파싱 실패 시 기본 메시지 사용
          }
          throw new Error(`${errorMessage} (Status: ${response.status})`);
        }

        const result = await response.json();
        
        // API 응답 구조: { success: true, message: "...", data: [...] }
        // Swagger 문서에 따르면 ApiResponseListGetFavoriteBakeriesResponse 형태
        let data = [];
        if (result?.data && Array.isArray(result.data)) {
          data = result.data;
        } else if (Array.isArray(result)) {
          data = result;
        }
        
        setFavoriteBakeries(data);
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('즐겨찾기 가게 목록 불러오기 실패:', error);
        setFavoriteBakeriesError(error.message || '즐겨찾기 가게 목록을 불러오지 못했습니다.');
        setFavoriteBakeries([]);
      } finally {
        setFavoriteBakeriesLoading(false);
      }
    };

    fetchFavoriteBakeries();
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

      mapInstance.current = new window.kakao.maps.Map(mapRef.current, options);
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

  // 즐겨찾기 가게 목록이 변경되면 지도에 마커 표시
  useEffect(() => {
    if (!mapInstance.current || !window.kakao || !window.kakao.maps || favoriteBakeries.length === 0) {
      return;
    }

    // 기존 마커 제거
    markers.current.forEach((marker) => marker.setMap(null));
    markers.current = [];

    // 빵집 위치 정보가 있다면 마커 추가
    // 주의: GetFavoriteBakeriesResponse에는 위도/경도가 없으므로
    // 주소를 기반으로 지오코딩하거나, 빵집 상세 정보를 가져와야 함
    // 일단 지도는 표시하고 마커는 나중에 추가 가능하도록 구조만 만들어둠
    const bounds = new window.kakao.maps.LatLngBounds();

    // TODO: 빵집의 위도/경도 정보가 필요함
    // 현재는 지도만 표시하고, 향후 위도/경도 정보를 받으면 마커를 추가할 수 있도록 구조화

    if (markers.current.length > 0) {
      mapInstance.current.setBounds(bounds);
    }
  }, [favoriteBakeries]);

  const handleBakeryClick = (bakeryId) => {
    navigate(`/bakery/${bakeryId}`);
  };

  return (
    <div className="favorite-stores-container">
      <div className="favorite-stores-inner">
        {/* 왼쪽: 즐겨찾기 가게 목록 */}
        <section className="favorite-stores-left">
          <div className="favorite-stores-list-card">
            {favoriteBakeriesLoading && (
              <p className="favorite-stores-status">즐겨찾기 가게를 불러오는 중...</p>
            )}
            {favoriteBakeriesError && !favoriteBakeriesLoading && (
              <p className="favorite-stores-error">{favoriteBakeriesError}</p>
            )}
            {!favoriteBakeriesLoading && !favoriteBakeriesError && favoriteBakeries.length === 0 && (
              <p className="favorite-stores-status">즐겨찾기한 가게가 없습니다.</p>
            )}
            {!favoriteBakeriesLoading && !favoriteBakeriesError && favoriteBakeries.length > 0 && (
              <ul className="favorite-stores-list">
                {favoriteBakeries.map((bakery) => (
                  <li
                    className="favorite-stores-item"
                    key={bakery.id}
                    onClick={() => handleBakeryClick(bakery.id)}
                  >
                    <div className="favorite-stores-images">
                      <div className="favorite-stores-image">
                        {bakery.photo1 ? (
                          <img src={bakery.photo1} alt={bakery.name} />
                        ) : (
                          <span className="favorite-stores-placeholder">BC</span>
                        )}
                      </div>
                      <div className="favorite-stores-image">
                        {bakery.photo2 ? (
                          <img src={bakery.photo2} alt={bakery.name} />
                        ) : (
                          <span className="favorite-stores-placeholder">BC</span>
                        )}
                      </div>
                    </div>
                    <div className="favorite-stores-info">
                      <div className="favorite-stores-name">{bakery.name}</div>
                      {bakery.phone && (
                        <div className="favorite-stores-phone">{bakery.phone}</div>
                      )}
                      {bakery.address && (
                        <div className="favorite-stores-address">{bakery.address}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* 오른쪽: 지도 영역 */}
        <section className="favorite-stores-right">
          <div className="favorite-stores-map" ref={mapRef}>
            {mapError && <div className="favorite-stores-map-error">{mapError}</div>}
          </div>
        </section>
      </div>
    </div>
  );
}

export default FavoriteStoresPage;
