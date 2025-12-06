import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import "./SearchPage.css";

export default function SearchPage() {
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState(""); // 빈 문자열로 시작
  const [sortBy, setSortBy] = useState("popular");
  const [searchInput, setSearchInput] = useState("");
  const [mapError, setMapError] = useState(null);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markers = useRef([]);
  const dropdownRef = useRef(null);

  // 빵집 목록 불러오기
  useEffect(() => {
    const fetchBakery = async () => {
      setLoading(true);
      try {
        // ✅ keyword는 항상 보내기 (빈 문자열이라도)
        const res = await api.get(
          `/api/bakeries?keyword=${keyword}&sort=${sortBy}`
        );

        console.log("전체 응답:", res.data);

        // ✅ 응답 구조: res.data.data
        const bakeryList = res.data.data || res.data || [];

        console.log("빵집 목록:", bakeryList);

        setList(bakeryList);
      } catch (err) {
        console.error("빵집 목록 불러오기 실패:", err);
        console.error("에러 상세:", err.response?.data);
        setList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBakery();
  }, [keyword, sortBy]);

  // 카카오맵 초기화
  useEffect(() => {
    const loadMap = () => {
      if (!window.kakao || !window.kakao.maps || !mapRef.current) {
        setMapError("카카오 지도 객체를 불러오지 못했습니다.");
        return;
      }
      const center = new window.kakao.maps.LatLng(35.8714, 128.6014); // 대구 좌표
      const options = {
        center,
        level: 5,
      };
      mapInstance.current = new window.kakao.maps.Map(mapRef.current, options);
      setMapError(null);
    };

    const kakaoMapKey = import.meta.env.VITE_KAKAO_MAP_KEY;

    if (!kakaoMapKey) {
      setMapError(
        "카카오맵을 사용하려면 .env 파일에 VITE_KAKAO_MAP_KEY를 설정해주세요."
      );
      return;
    }

    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(loadMap);
      return;
    }

    const existingScript = document.querySelector("script[data-kakao-maps]");
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        window.kakao.maps.load(loadMap);
      });
      return;
    }

    const script = document.createElement("script");
    const kakaoSdkUrl = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoMapKey}&autoload=false`;
    script.src = kakaoSdkUrl;
    script.async = true;
    script.dataset.kakaoMaps = "true";
    script.onload = () => {
      window.kakao.maps.load(loadMap);
    };
    script.onerror = () => {
      setMapError("카카오 지도 스크립트를 불러오지 못했습니다.");
    };
    document.head.appendChild(script);
  }, []);

  // 빵집 목록이 변경될 때 지도에 마커 추가
  useEffect(() => {
    if (!mapInstance.current || !window.kakao || !window.kakao.maps) return;

    // 기존 마커 제거
    markers.current.forEach((marker) => marker.setMap(null));
    markers.current = [];

    if (list.length === 0) return;

    // 새 마커 추가
    const bounds = new window.kakao.maps.LatLngBounds();

    list.forEach((bakery) => {
      // ✅ API 응답 필드명에 맞게 수정 (camelCase 또는 snake_case)
      const lat = bakery.latitude || bakery.lat;
      const lng = bakery.longitude || bakery.lng;
      const bakeryId = bakery.id || bakery.bakery_id;

      if (lat && lng) {
        const position = new window.kakao.maps.LatLng(lat, lng);

        const marker = new window.kakao.maps.Marker({
          position: position,
          map: mapInstance.current,
        });

        // 마커 클릭 이벤트
        window.kakao.maps.event.addListener(marker, "click", () => {
          handleBakeryClick(bakeryId);
        });

        markers.current.push(marker);
        bounds.extend(position);
      }
    });

    // 모든 마커가 보이도록 지도 범위 조정
    if (markers.current.length > 0) {
      mapInstance.current.setBounds(bounds);
    }
  }, [list]);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSortDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 검색 실행
  const handleSearch = (e) => {
    e.preventDefault();
    setKeyword(searchInput);
  };

  // 정렬 드롭다운 토글
  const toggleSortDropdown = () => {
    setIsSortDropdownOpen(!isSortDropdownOpen);
  };

  // 정렬 변경
  const handleSortChange = (sort) => {
    setSortBy(sort);
    setIsSortDropdownOpen(false);
  };

  // 정렬 옵션 텍스트
  const getSortText = () => {
    return sortBy === "popular" ? "인기순" : "리뷰순";
  };

  // 개별 빵집 선택
  const handleBakeryClick = (bakeryId) => {
    console.log("선택된 빵집 ID:", bakeryId);
    navigate(`/bakery/${bakeryId}`);
  };

  return (
    <div className="search-page">
      {/* 왼쪽: 검색 및 목록 영역 */}
      <div className="left-panel">
        {/* 검색창 */}
        <div className="search-section">
          {/* 필터 버튼 */}
          <div className="sort-dropdown-container" ref={dropdownRef}>
            <button className="sort-dropdown-btn" onClick={toggleSortDropdown}>
              <span className="filter-icon">🎚️</span>
              <span>필터</span>
            </button>

            {isSortDropdownOpen && (
              <div className="sort-dropdown-menu">
                <button
                  className={`sort-option ${
                    sortBy === "popular" ? "active" : ""
                  }`}
                  onClick={() => handleSortChange("popular")}
                >
                  인기순
                </button>
                <button
                  className={`sort-option ${
                    sortBy === "review" ? "active" : ""
                  }`}
                  onClick={() => handleSortChange("review")}
                >
                  리뷰순
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSearch} className="search-form">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="검색"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="search-input"
            />
          </form>
        </div>

        {/* 빵집 목록 */}
        <div className="bakery-list">
          {loading ? (
            <div className="loading">로딩 중...</div>
          ) : (
            list.map((bakery) => {
              // ✅ 필드명 유연하게 처리 (camelCase와 snake_case 모두 지원)
              const bakeryId = bakery.id || bakery.bakery_id;
              const favoriteCount =
                bakery.favoriteCount || bakery.favorite_count || 0;
              const reviewCount =
                bakery.reviewCount || bakery.review_count || 0;

              return (
                <div
                  key={bakeryId}
                  className="bakery-card"
                  onClick={() => handleBakeryClick(bakeryId)}
                >
                  {/* 빵집 사진 */}
                  <div className="bakery-image">
                    <img src={bakery.photo1} alt={bakery.name} />
                  </div>

                  {/* 빵집 정보 */}
                  <div className="bakery-info">
                    <h3 className="star">{bakery.name}</h3>

                    {/* 별점과 리뷰 수 */}
                    <div className="bakery-rating">
                      <span className="star">⭐</span>
                      <span className="rating-value">{bakery.rating}</span>
                      <span className="review-info">
                        ❤️ {favoriteCount} 리뷰 {reviewCount}
                      </span>
                    </div>

                    {/* 한줄 소개 */}
                    {bakery.description && (
                      <p className="bakery-description">{bakery.description}</p>
                    )}

                    {/* 위치 */}
                    <div className="bakery-location">
                      <span className="location-icon">📍</span>
                      <span className="address">{bakery.address}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {!loading && list.length === 0 && (
            <div className="no-results">검색 결과가 없습니다.</div>
          )}
        </div>
      </div>

      {/* 오른쪽: 지도 영역 */}
      <div className="right-panel">
        <div className="map-container">
          {mapError ? (
            <div className="map-error">{mapError}</div>
          ) : (
            <div ref={mapRef} className="kakao-map"></div>
          )}
        </div>
      </div>
    </div>
  );
}
