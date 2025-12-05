import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./BakeryTour.css";

const BakeryTour = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [mapError, setMapError] = useState(null);
  const [selectedTour, setSelectedTour] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const markers = useRef([]);

  // 샘플 투어 데이터 (실제 사용 시 백엔드 API나 props로 받아옴)
  const tours = [
    {
      id: 1,
      title: "48시간이 모자른 부산 빵지순례",
      region: "이동시간 1시간 24분 · 1박2일, 총거리 39.6km",
      likes: 500,
      bakeries: [
        {
          name: "배롱산",
          location: { lat: 35.1795, lng: 129.0756 },
          image: null,
        },
        {
          name: "알밤식",
          location: { lat: 35.1598, lng: 129.0629 },
          image: null,
        },
      ],
    },
    {
      id: 2,
      title: "용산구 숨겨둔 빵집 폰다..",
      region: "이동시간 40분 · 당일치기 · 총거리 12km",
      likes: 500,
      bakeries: [
        {
          name: "몽슈밍",
          location: { lat: 37.5326, lng: 126.9903 },
          image: null,
        },
        {
          name: "푸본",
          location: { lat: 37.5219, lng: 126.9771 },
          image: null,
        },
      ],
    },
    {
      id: 3,
      title: "대전까지 와서 이 빵 안먹고 갈거야?",
      region: "이동시간 1시간 17분 · 당일치기 · 총거리 23.4km",
      likes: 500,
      bakeries: [
        {
          name: "신진옥",
          location: { lat: 36.3504, lng: 127.3845 },
          image: null,
        },
        {
          name: "우리동네",
          location: { lat: 36.3274, lng: 127.4258 },
          image: null,
        },
      ],
    },
    {
      id: 4,
      title: "나 빵순인데, 이 빵지순례 대박이다",
      region: "이동시간 40분 · 당일치기 · 총거리 15.8km",
      likes: 500,
      bakeries: [
        { name: "ATO", location: { lat: 37.5665, lng: 126.978 }, image: null },
        {
          name: "노티드",
          location: { lat: 37.5172, lng: 127.0473 },
          image: null,
        },
      ],
    },
  ];

  // 카카오맵 초기화
  useEffect(() => {
    const loadMap = () => {
      if (!window.kakao || !window.kakao.maps || !mapRef.current) {
        setMapError("카카오 지도 객체를 불러오지 못했습니다.");
        return;
      }

      // 서울 중심으로 초기 위치 설정
      const position = new window.kakao.maps.LatLng(37.5665, 126.978);

      const options = {
        center: position,
        level: 8,
      };

      mapInstance.current = new window.kakao.maps.Map(mapRef.current, options);
      setMapError(null);

      // 첫 번째 투어를 기본 선택
      if (tours.length > 0) {
        handleTourSelect(tours[0]);
      }
    };

    const kakaoMapKey = import.meta.env.VITE_KAKAO_MAP_KEY;

    if (!kakaoMapKey) {
      setMapError("카카오맵 API 키가 필요합니다.");
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

  // 투어 선택 시 마커 표시
  const handleTourSelect = (tour) => {
    setSelectedTour(tour);

    if (!mapInstance.current || !window.kakao) return;

    // 기존 마커 제거
    markers.current.forEach((marker) => marker.setMap(null));
    markers.current = [];

    if (!tour.bakeries || tour.bakeries.length === 0) return;

    // 새 마커 추가
    const bounds = new window.kakao.maps.LatLngBounds();

    tour.bakeries.forEach((bakery, index) => {
      const position = new window.kakao.maps.LatLng(
        bakery.location.lat,
        bakery.location.lng
      );

      const marker = new window.kakao.maps.Marker({
        position: position,
        map: mapInstance.current,
      });

      // 마커에 번호 표시를 위한 커스텀 오버레이
      const content = `
        <div style="
          background: #8B4513;
          color: white;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">
          ${index + 1}
        </div>
      `;

      const customOverlay = new window.kakao.maps.CustomOverlay({
        position: position,
        content: content,
        yAnchor: 1.5,
      });

      customOverlay.setMap(mapInstance.current);
      markers.current.push(marker);
      markers.current.push(customOverlay);

      bounds.extend(position);
    });

    // 모든 마커가 보이도록 지도 범위 조정
    mapInstance.current.setBounds(bounds);
  };

  // 검색 필터링
  const filteredTours = tours.filter((tour) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      tour.title.toLowerCase().includes(query) ||
      tour.region.toLowerCase().includes(query) ||
      tour.bakeries.some((bakery) => bakery.name.toLowerCase().includes(query))
    );
  });

  return (
    <div className="bakery-tour-container">
      {/* 왼쪽 투어 목록 */}
      <div className="tour-list-section">
        <div className="search-header">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="빵집, 지역 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-icon">🔍</button>
          </div>
          <button onClick={() => navigate("/")} className="home-button">
            🏠
          </button>
        </div>

        <div className="tour-list">
          {filteredTours.length > 0 ? (
            filteredTours.map((tour) => (
              <div
                key={tour.id}
                className={`tour-card ${
                  selectedTour?.id === tour.id ? "selected" : ""
                }`}
                onClick={() => handleTourSelect(tour)}
              >
                <div className="tour-images">
                  <div className="mini-map">
                    {tour.bakeries.map((_, index) => (
                      <div
                        key={index}
                        className="map-marker"
                        style={{
                          top: `${20 + index * 30}%`,
                          left: `${20 + index * 20}%`,
                        }}
                      >
                        {index + 1}
                      </div>
                    ))}
                  </div>
                  <div className="bakery-images">
                    {tour.bakeries.map((bakery, index) => (
                      <div key={index} className="bakery-thumbnail">
                        {bakery.image ? (
                          <img src={bakery.image} alt={bakery.name} />
                        ) : (
                          <div className="bakery-placeholder">
                            <span className="placeholder-icon">🥐</span>
                          </div>
                        )}
                        <span className="bakery-number">{index + 1}</span>
                        <span className="bakery-name">{bakery.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="tour-info">
                  <h3>{tour.title}</h3>
                  <p className="tour-region">{tour.region}</p>
                  <div className="tour-likes">❤️ {tour.likes}개</div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <p>검색 결과가 없습니다</p>
              <span>다른 키워드로 검색해보세요</span>
            </div>
          )}
        </div>
      </div>

      {/* 오른쪽 지도 */}
      <div className="map-section">
        <div ref={mapRef} className="kakao-map"></div>
        {mapError && <div className="map-error">{mapError}</div>}

        {selectedTour && (
          <div className="selected-tour-info">
            <h3>{selectedTour.title}</h3>
            <p>{selectedTour.region}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BakeryTour;
