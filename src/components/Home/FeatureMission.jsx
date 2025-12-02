import React from 'react';
import './FeatureMission.css'; // 전용 CSS 파일을 import 합니다.
import locationImg from '../../assets/location.png';
import communityImg from '../../assets/community.png';
import breadcastImg from '../../assets/breadcast.png';
import saveImg from '../../assets/save.png';

function FeatureMission() {
  return (
    <section className="feature-mission-container">
      
      {/* 1. 섹션 제목 */}
      <h2 className="feature-title">브래드캐스트에서 누릴 수 있는 기능!</h2>
      
      {/* 2. 기능 카드 리스트 */}
      <div className="feature-cards-wrapper">
        
        {/* 카드 1: 위치기반 */}
        <img 
          src={locationImg} 
          alt="위치기반 기능 설명" 
          className="feature-card-image" 
        />

        {/* 카드 2: 제보 커뮤니티 */}
        <img 
          src={communityImg} 
          alt="제보 커뮤니티 기능 설명" 
          className="feature-card-image" 
        />

        {/* 카드 3: 빵지순례 */}
        <img 
          src={breadcastImg} 
          alt="빵지순례 기능 설명" 
          className="feature-card-image" 
        />

        {/* 카드 4: 저장기록 */}
        <img 
          src={saveImg} 
          alt="저장 기능 설명" 
          className="feature-card-image" 
        />
        
      </div>
    </section>
  );
}

export default FeatureMission;