

import React from 'react';

import HeroIntro from '../components/Home/HeroIntro';
import FeatureMission from '../components/Home/FeatureMission';
import ReviewSection from '../components/Home/ReviewSection';
import Footer from '../components/Home/Footer';

function HomePage() {
  return (
    <div className="homepage-wrapper">
      <HeroIntro />
      <FeatureMission />
      <ReviewSection />
      <Footer />
    </div>
  );
}

export default HomePage;