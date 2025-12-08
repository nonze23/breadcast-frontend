import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig"; // ✅ api import 추가
import "./FavoriteStoresPage.css";

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
    const fetchFavoriteBakeries = async () => {
      try {
        setFavoriteBakeriesLoading(true);
        setFavoriteBakeriesError(null);

        // ✅ api.get 사용
        const response = await api.get("/api/members/me/favorites/bakeries");

        console.log("즐겨찾기 응답:", response.data);

        // API 응답 구조: { success: true, message: "...", data: [...] }
        let data = [];
        if (response.data?.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        } else if (Array.isArray(response.data)) {
          data = response.data;
        }

        console.log("즐겨찾기 목록:", data);
        setFavoriteBakeries(data);
      } catch (error) {
        console.error("즐겨찾기 가게 목록 불러오기 실패:", error);

        // ✅ 401은 인터셉터에서 자동 처리
        if (error.response?.status !== 401) {
          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            "즐겨찾기 가게 목록을 불러오지 못했습니다.";

          setFavoriteBakeriesError(errorMessage);
        }
        setFavoriteBakeries([]);
      } finally {
        setFavoriteBakeriesLoading(false);
      }
    };

    fetchFavoriteBakeries();
  }, []);

  useEffect(() => {
    const loadMap = () => {
      if (!window.kakao || !window.kakao.maps || !mapRef.current) {
        setMapError("카카오 지도 객체를 불러오지 못했습니다.");
        return;
      }

      const center = new window.kakao.maps.LatLng(37.5665, 126.978); // 서울 시청 근처 예시
      const options = {
        center,
        level: 5,
      };

      mapInstance.current = new window.kakao.maps.Map(mapRef.current, options);
      setMapError(null);
    };

    if (!import.meta.env.VITE_KAKAO_MAP_KEY) {
      setMapError(
        ".env 파일에 VITE_KAKAO_MAP_KEY가 설정되어 있는지 확인해주세요."
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
    const kakaoSdkUrl = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${
      import.meta.env.VITE_KAKAO_MAP_KEY
    }&autoload=false`;
    script.src = kakaoSdkUrl;
    script.async = true;
    script.dataset.kakaoMaps = "true";
    script.onload = () => {
      window.kakao.maps.load(loadMap);
    };
    script.onerror = () => {
      setMapError(
        "카카오 지도 스크립트를 불러오지 못했습니다. 네트워크 상태와 앱 키를 확인해주세요."
      );
    };
    document.head.appendChild(script);
  }, []);

  // 즐겨찾기 가게 목록이 변경되면 지도에 마커 표시
  useEffect(() => {
    if (
      !mapInstance.current ||
      !window.kakao ||
      !window.kakao.maps ||
      favoriteBakeries.length === 0
    ) {
      return;
    }

    // 기존 마커 제거
    markers.current.forEach((marker) => marker.setMap(null));
    markers.current = [];

    // 빵집 위치 정보가 있다면 마커 추가
    const bounds = new window.kakao.maps.LatLngBounds();

    favoriteBakeries.forEach((bakery) => {
      // ✅ 위도/경도 정보가 있으면 마커 추가
      if (bakery.latitude && bakery.longitude) {
        const position = new window.kakao.maps.LatLng(
          bakery.latitude,
          bakery.longitude
        );

        const marker = new window.kakao.maps.Marker({
          position: position,
          map: mapInstance.current,
        });

        // 마커 클릭 시 빵집 상세로 이동
        window.kakao.maps.event.addListener(marker, "click", () => {
          navigate(`/bakery/${bakery.id}`);
        });

        markers.current.push(marker);
        bounds.extend(position);
      }
    });

    // 마커가 있으면 지도 범위 조정
    if (markers.current.length > 0) {
      mapInstance.current.setBounds(bounds);
    }
  }, [favoriteBakeries, navigate]);

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
              <p className="favorite-stores-status">
                즐겨찾기 가게를 불러오는 중...
              </p>
            )}
            {favoriteBakeriesError && !favoriteBakeriesLoading && (
              <p className="favorite-stores-error">{favoriteBakeriesError}</p>
            )}
            {!favoriteBakeriesLoading &&
              !favoriteBakeriesError &&
              favoriteBakeries.length === 0 && (
                <p className="favorite-stores-status">
                  즐겨찾기한 가게가 없습니다.
                </p>
              )}
            {!favoriteBakeriesLoading &&
              !favoriteBakeriesError &&
              favoriteBakeries.length > 0 && (
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
                            <span className="favorite-stores-placeholder">
                              BC
                            </span>
                          )}
                        </div>
                        <div className="favorite-stores-image">
                          {bakery.photo2 ? (
                            <img src={bakery.photo2} alt={bakery.name} />
                          ) : (
                            <span className="favorite-stores-placeholder">
                              BC
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="favorite-stores-info">
                        <div className="favorite-stores-name">
                          {bakery.name}
                        </div>
                        {bakery.phone && (
                          <div className="favorite-stores-phone">
                            {bakery.phone}
                          </div>
                        )}
                        {bakery.address && (
                          <div className="favorite-stores-address">
                            {bakery.address}
                          </div>
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
            {mapError && (
              <div className="favorite-stores-map-error">{mapError}</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default FavoriteStoresPage;
