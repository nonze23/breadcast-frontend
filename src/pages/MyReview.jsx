import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import "./MyReview.css";

function MyReview() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [mapError, setMapError] = useState(null);
  const [myReviews, setMyReviews] = useState([]);
  const [myReviewsLoading, setMyReviewsLoading] = useState(true);
  const [myReviewsError, setMyReviewsError] = useState(null);
  const mapInstance = useRef(null);
  const markers = useRef([]);

  useEffect(() => {
    const fetchMyReviews = async () => {
      try {
        setMyReviewsLoading(true);
        setMyReviewsError(null);

        // ✅ api.get 사용
        const response = await api.get("/api/members/me/bakery-reviews");

        console.log("내 리뷰 응답:", response.data);

        // API 응답 구조: { success: true, message: "...", data: [...] }
        let data = [];
        if (response.data?.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        } else if (Array.isArray(response.data)) {
          data = response.data;
        }

        console.log("내 리뷰 목록:", data);
        setMyReviews(data);
      } catch (error) {
        console.error("내 리뷰 목록 불러오기 실패:", error);

        // ✅ 401은 인터셉터에서 자동 처리
        if (error.response?.status !== 401) {
          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            "내 리뷰 목록을 불러오지 못했습니다.";

          setMyReviewsError(errorMessage);
        }
        setMyReviews([]);
      } finally {
        setMyReviewsLoading(false);
      }
    };

    fetchMyReviews();
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

  // 내 리뷰 목록이 변경되면 지도에 마커 표시
  useEffect(() => {
    if (
      !mapInstance.current ||
      !window.kakao ||
      !window.kakao.maps ||
      myReviews.length === 0
    ) {
      return;
    }

    // 기존 마커 제거
    markers.current.forEach((marker) => marker.setMap(null));
    markers.current = [];

    // 빵집 위치 정보가 있다면 마커 추가
    const bounds = new window.kakao.maps.LatLngBounds();

    myReviews.forEach((review) => {
      // ✅ bakeryId와 위도/경도 정보가 있으면 마커 추가 (실제 구조에 맞게 수정 필요)
      if (review.bakeryId && review.latitude && review.longitude) {
        const position = new window.kakao.maps.LatLng(
          review.latitude,
          review.longitude
        );

        const marker = new window.kakao.maps.Marker({
          position: position,
          map: mapInstance.current,
        });

        // 마커 클릭 시 빵집 상세로 이동
        window.kakao.maps.event.addListener(marker, "click", () => {
          navigate(`/bakery/${review.bakeryId}`, {
            state: { targetTab: "review" },
          });
        });

        markers.current.push(marker);
        bounds.extend(position);
      }
    });

    // 마커가 있으면 지도 범위 조정
    if (markers.current.length > 0) {
      mapInstance.current.setBounds(bounds);
    }
  }, [myReviews, navigate]);

  const handleReviewClick = (bakeryId) => {
    if (bakeryId) {
      navigate(`/bakery/${bakeryId}`, { state: { targetTab: "review" } });
    }
  };

  // 별점 렌더링 함수
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "star filled" : "star"}>
          ★
        </span>
      );
    }
    return stars;
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="my-review-container">
      <div className="my-review-inner">
        {/* 왼쪽: 내 리뷰 목록 */}
        <section className="my-review-left">
          <div className="my-review-list-card">
            <div className="my-review-header">내가 작성한 리뷰</div>

            {myReviewsLoading && (
              <p className="my-review-status">리뷰를 불러오는 중...</p>
            )}
            {myReviewsError && !myReviewsLoading && (
              <p className="my-review-error">{myReviewsError}</p>
            )}
            {!myReviewsLoading && !myReviewsError && myReviews.length === 0 && (
              <p className="my-review-status">아직 작성한 리뷰가 없습니다.</p>
            )}
            {!myReviewsLoading && !myReviewsError && myReviews.length > 0 && (
              <ul className="my-review-list">
                {myReviews.map((review) => (
                  <li
                    className="my-review-item"
                    key={review.reviewId || review.bakeryReviewId}
                    onClick={() => handleReviewClick(review.bakeryId)}
                  >
                    <div className="my-review-content">
                      {/* 빵집 이름 */}
                      {review.name && (
                        <div className="my-review-bakery-name">
                          {review.name}
                        </div>
                      )}

                      {/* 별점 표시 제거 */}

                      {/* 리뷰 텍스트 */}
                      {review.text && (
                        <div className="my-review-text">{review.text}</div>
                      )}

                      {/* 리뷰 사진 */}
                      {review.photo && (
                        <div className="my-review-photo">
                          <img src={review.photo} alt="리뷰 사진" />
                        </div>
                      )}

                      {/* 작성 날짜 */}
                      {review.date && (
                        <div className="my-review-date">
                          {formatDate(review.date)}
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
        <section className="my-review-right">
          <div className="my-review-map" ref={mapRef}>
            {mapError && <div className="my-review-map-error">{mapError}</div>}
          </div>
        </section>
      </div>
    </div>
  );
}

export default MyReview;
