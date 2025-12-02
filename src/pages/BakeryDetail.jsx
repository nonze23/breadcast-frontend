import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import BakeryMenu from "../components/BakeryDetail/BakeryMenu";
import BakeryReview from "../components/BakeryDetail/BakeryReview";
import "./BakeryDetail.css";

export default function BakeryDetail() {
  const { bakeryId } = useParams();
  const navigate = useNavigate();
  const [bakery, setBakery] = useState(null);
  const [menus, setMenus] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [mapError, setMapError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // 빵집 상세 정보 불러오기
  useEffect(() => {
    const fetchBakeryDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          `http://43.200.233.19/api/bakeries/${bakeryId}`
        );

        console.log("빵집 상세 응답:", res.data);

        const bakeryData = res.data.data || res.data;
        setBakery(bakeryData);

        if (bakeryData.isFavorited !== undefined) {
          setIsFavorite(bakeryData.isFavorited);
        }
      } catch (err) {
        console.error("빵집 상세 정보 불러오기 실패:", err);
        setError("빵집 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchBakeryDetail();
  }, [bakeryId]);

  // 관심 가게 추가/삭제 처리
  const handleToggleFavorite = async () => {
    if (isFavoriteLoading) return;

    setIsFavoriteLoading(true);

    try {
      if (isFavorite) {
        await axios.delete(
          `http://43.200.233.19/api/members/me/favorites/bakeries/${bakeryId}`
        );
        setIsFavorite(false);
      } else {
        await axios.post(
          `http://43.200.233.19/api/members/me/favorites/bakeries/${bakeryId}`
        );
        setIsFavorite(true);
      }
    } catch (err) {
      console.error("관심 가게 처리 실패:", err);

      if (err.response?.status === 401) {
        alert("로그인이 필요한 서비스입니다.");
      } else {
        alert("관심 가게 처리에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  // 카카오맵 초기화
  useEffect(() => {
    if (!bakery) return;

    const loadMap = () => {
      if (!window.kakao || !window.kakao.maps || !mapRef.current) {
        setMapError("카카오 지도 객체를 불러오지 못했습니다.");
        return;
      }

      const position = new window.kakao.maps.LatLng(
        bakery.latitude,
        bakery.longitude
      );

      const options = {
        center: position,
        level: 3,
      };

      mapInstance.current = new window.kakao.maps.Map(mapRef.current, options);

      const marker = new window.kakao.maps.Marker({
        position: position,
        map: mapInstance.current,
      });

      setMapError(null);
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
  }, [bakery]);

  const handleGoBack = () => {
    navigate(-1);
  };

  // 메뉴와 리뷰 불러오기
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await axios.get(
          `http://43.200.233.19/api/bakeries/${bakeryId}/menus`
        );

        console.log("메뉴 응답:", res.data);

        const data = res.data.data || res.data;
        setMenus(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("메뉴 불러오기 실패:", err);
        setMenus([]);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await axios.get(
          `http://43.200.233.19/api/bakeries/${bakeryId}/bakery-reviews`
        );

        console.log("리뷰 응답:", res.data);

        const data = res.data.data || res.data;
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("리뷰 불러오기 실패:", err);
        setReviews([]);
      }
    };

    fetchMenus();
    fetchReviews();
  }, [bakeryId]);

  if (loading) {
    return <div className="loading-container">로딩 중...</div>;
  }

  if (error) {
    return (
      <div className="loading-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={handleGoBack} className="back-button">
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!bakery) {
    return (
      <div className="loading-container">빵집 정보를 찾을 수 없습니다.</div>
    );
  }

  const photos = [bakery.photo1, bakery.photo2].filter(Boolean);

  return (
    <div className="bakery-detail-page">
      <div className="detail-left-panel">
        {/* 사진 갤러리 */}
        <div className="photo-gallery">
          {photos.map((photo, index) => (
            <img
              key={index}
              src={photo}
              alt={`${bakery.name} ${index + 1}`}
              className="bakery-photo"
            />
          ))}
          <button className="close-btn" onClick={handleGoBack}>
            ✕
          </button>
        </div>

        {/* 빵집 기본 정보 */}
        <div className="bakery-header">
          <h1 className="bakery-title">{bakery.name}</h1>
          <button
            className="favorite-btn"
            onClick={handleToggleFavorite}
            disabled={isFavoriteLoading}
          >
            <span className="heart">{isFavorite ? "🤎" : "🤍"}</span>
          </button>
        </div>

        {/* 탭 메뉴 */}
        <div className="tab-menu">
          <button
            className={`tab-btn ${activeTab === "home" ? "active" : ""}`}
            onClick={() => setActiveTab("home")}
          >
            홈
          </button>
          <button
            className={`tab-btn ${activeTab === "menu" ? "active" : ""}`}
            onClick={() => setActiveTab("menu")}
          >
            메뉴
          </button>
          <button
            className={`tab-btn ${activeTab === "review" ? "active" : ""}`}
            onClick={() => setActiveTab("review")}
          >
            리뷰
          </button>
          <button
            className={`tab-btn ${activeTab === "info" ? "active" : ""}`}
            onClick={() => setActiveTab("info")}
          >
            제보
          </button>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="tab-content">
          {activeTab === "home" && (
            <div className="home-tab">
              {/* 주소 */}
              <div className="info-item">
                <span className="info-icon">📍</span>
                <div className="info-text">
                  <div className="info-label">{bakery.address}</div>
                </div>
              </div>

              {/* 영업 시간 */}
              <div className="info-item">
                <span className="info-icon">🕐</span>
                <div className="info-text">
                  <div className="info-label">영업시간 정보 준비중</div>
                </div>
              </div>

              {/* 전화번호 */}
              <div className="info-item">
                <span className="info-icon">📞</span>
                <div className="info-text">
                  <a href={`tel:${bakery.phone}`} className="info-link">
                    {bakery.phone}
                  </a>
                  <span className="copy-text">복사</span>
                </div>
              </div>

              {/* 웹사이트 */}
              {bakery.URL && (
                <div className="info-item">
                  <span className="info-icon">🌐</span>
                  <div className="info-text">
                    <a
                      href={bakery.URL}
                      tsarget="_blank"
                      rel="noopener noreferrer"
                      className="info-link"
                    >
                      {bakery.URL}
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "menu" && (
            <div className="menu-tab">
              <BakeryMenu menus={menus} />
            </div>
          )}

          {activeTab === "review" && (
            <div className="review-tab">
              <BakeryReview reviews={reviews} />
            </div>
          )}

          {activeTab === "info" && (
            <div className="info-tab">
              <p className="empty-message">제보 정보가 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* 오른쪽: 지도 */}
      <div className="detail-right-panel">
        <div className="detail-map-container">
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
