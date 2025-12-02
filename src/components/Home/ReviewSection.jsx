import React, { useState } from 'react';
import './ReviewSection.css';
import homeBannerImg from '../../assets/home1.png';
import storeImg from '../../assets/store.png';

function ReviewSection() {
  const reviews = [
    {
      id: 1,
      user: '김**',
      date: '2025.09.08',
      text:
        '매번 sns를 찾기가 어려웠는데 이 웹사이트를 통해서 쉽게 찾아 빵지순례를 할 수 있었어요! 덕분에 좋은 친구도 만나서 같이 빵여행을 즐기고 있답니다.',
    },
    {
      id: 2,
      user: '김**',
      date: '2025.09.08',
      text:
        '다양한 빵집 정보를 한 번에 볼 수 있어서 너무 편해요. 다음 빵지순례도 여기서 계획 중입니다.',
    },
    {
      id: 3,
      user: '김**',
      date: '2025.09.08',
      text:
        '숨은 빵집들을 찾아다니는 재미가 쏠쏠해요. 리뷰와 평점이 있어 실패 없는 빵투어가 가능해졌어요.',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const getCardClass = (index) => {
    const prevIndex = (currentIndex - 1 + reviews.length) % reviews.length;
    const nextIndex = (currentIndex + 1) % reviews.length;

    if (index === currentIndex) return 'review-card review-card--center';
    if (index === prevIndex) return 'review-card review-card--side review-card--left';
    if (index === nextIndex) return 'review-card review-card--side review-card--right';
    return 'review-card review-card--hidden';
  };

  return (
    <section className="review-container">
      {/* 상단 배너 */}
      <div className="review-banner">
        <img src={homeBannerImg} alt="맛있는 빵 진열대" />
        <div className="banner-overlay-text">
          <p>저의 웹사이트를 둘러보세요!</p>
          <p>빵에 진심하여 빵지도를 만들고 고객들의 첫발길을 멈추기 위한 제보 커뮤니티까지!!</p>
          <p>또 여러 빵가게의 루트와 이 모든 걸 저장할 수 있는 마이페이지 스크랩 기능이 있습니다.</p>
        </div>
      </div>

      {/* 기획 의도 섹션 */}
      <div className="plan-section">
        <div className="plan-inner">
          <div className="plan-text">
            <h2>저희 브래드 캐스트의 기획의도는</h2>
            <p>
              빵을 좋아하는 사람들이 자연스럽게 모여 각자의 빵집 투어를 공유하고,
              동네 베이커리부터 전국의 숨은 명소까지 담고자 하여 만들게 되었습니다.
            </p>
            <p>
              실시간 재고, 영업시간, 빵집 투어 코스 추천·동선 안내, 메뉴별 리뷰·평점·가격 정보를
              한 화면에서 확인할 수 있도록 기획하고 있습니다.
            </p>
            <p>
              또한 사용 편의를 위해 지도를 화면 우측에 고정해, 주변 빵집 위치를 한눈에 보고
              쉽게 찾아갈 수 있도록 구성했습니다.
            </p>
          </div>
          <div className="plan-visual">
            <img src={storeImg} alt="빵집 위치를 나타내는 아이콘" />
          </div>
        </div>
      </div>

      {/* 모아보는 후기 섹션 */}
      <section className="reviews-section">
        <h2 className="reviews-title">모아보는 후기</h2>

        <div className="reviews-cards">
          {/* 좌우 화살표 버튼 */}
          <button
            type="button"
            className="review-arrow review-arrow--left"
            onClick={prevReview}
            aria-label="이전 후기"
          >
            ‹
          </button>

          <button
            type="button"
            className="review-arrow review-arrow--right"
            onClick={nextReview}
            aria-label="다음 후기"
          >
            ›
          </button>

          {/* 후기 카드들 */}
          {reviews.map((review, index) => (
            <article key={review.id} className={getCardClass(index)}>
              <header className="review-card-header">
                <span className="review-user">{review.user}</span>
                <span className="review-date">{review.date}</span>
              </header>
              <div className="review-stars">
                <span>⭐</span>
                <span>⭐</span>
                <span>⭐</span>
                <span>⭐</span>
                <span>⭐</span>
              </div>
              <p className="review-text">{review.text}</p>
            </article>
          ))}
        </div>

        <div className="review-dots">
          {reviews.map((review, index) => (
            <span
              key={review.id}
              className={`dot ${index === currentIndex ? 'dot--active' : ''}`}
            ></span>
          ))}
        </div>
      </section>
    </section>
  );
}

export default ReviewSection;