import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./BakeryTourForm.css";

const BakeryTourForm = () => {
  const navigate = useNavigate();
  const { tourId } = useParams();
  const isEditMode = !!tourId;

  const [formData, setFormData] = useState({
    title: "",
    region: "",
    duration: "",
    distance: "",
    travelTime: "",
    description: "",
    author: "익명",
  });

  const [bakeries, setBakeries] = useState([
    {
      id: Date.now(),
      name: "",
      address: "",
      description: "",
      menu: [""],
      location: { lat: 37.5665, lng: 126.978 },
      image: null,
    },
  ]);

  // 수정 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (isEditMode) {
      const tour = getTourById(tourId);
      if (tour) {
        setFormData({
          title: tour.title,
          region: tour.region,
          duration: tour.duration,
          distance: tour.distance,
          travelTime: tour.travelTime,
          description: tour.description,
          author: tour.author,
        });
        setBakeries(tour.bakeries);
      } else {
        alert("투어를 찾을 수 없습니다.");
        navigate("/bakery-tour");
      }
    }
  }, [tourId, isEditMode, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBakeryChange = (index, field, value) => {
    const newBakeries = [...bakeries];
    newBakeries[index][field] = value;
    setBakeries(newBakeries);
  };

  const handleMenuChange = (bakeryIndex, menuIndex, value) => {
    const newBakeries = [...bakeries];
    newBakeries[bakeryIndex].menu[menuIndex] = value;
    setBakeries(newBakeries);
  };

  const addMenu = (bakeryIndex) => {
    const newBakeries = [...bakeries];
    newBakeries[bakeryIndex].menu.push("");
    setBakeries(newBakeries);
  };

  const removeMenu = (bakeryIndex, menuIndex) => {
    const newBakeries = [...bakeries];
    newBakeries[bakeryIndex].menu.splice(menuIndex, 1);
    setBakeries(newBakeries);
  };

  const addBakery = () => {
    setBakeries([
      ...bakeries,
      {
        id: Date.now(),
        name: "",
        address: "",
        description: "",
        menu: [""],
        location: { lat: 37.5665, lng: 126.978 },
        image: null,
      },
    ]);
  };

  const removeBakery = (index) => {
    if (bakeries.length === 1) {
      alert("최소 1개의 빵집이 필요합니다.");
      return;
    }
    const newBakeries = [...bakeries];
    newBakeries.splice(index, 1);
    setBakeries(newBakeries);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (bakeries.some((b) => !b.name.trim())) {
      alert("모든 빵집의 이름을 입력해주세요.");
      return;
    }

    const tourData = {
      ...formData,
      bakeries: bakeries.map((b) => ({
        ...b,
        menu: b.menu.filter((m) => m.trim()),
      })),
    };

    if (isEditMode) {
      updateTour(tourId, tourData);
      alert("빵지순례가 수정되었습니다!");
      navigate(`/bakery-tour/${tourId}`);
    } else {
      const newTour = addTour(tourData);
      alert("빵지순례가 등록되었습니다!");
      navigate(`/bakery-tour/${newTour.id}`);
    }
  };

  const handleCancel = () => {
    if (window.confirm("작성을 취소하시겠습니까?")) {
      navigate(-1);
    }
  };

  return (
    <div className="tour-form-container">
      <div className="form-wrapper">
        <div className="form-header">
          <h1>{isEditMode ? "빵지순례 수정하기" : "빵지순례 등록하기"}</h1>
          <p className="form-subtitle">
            {isEditMode
              ? "빵지순례 정보를 수정해주세요"
              : "나만의 빵지순례를 공유해보세요"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="tour-form">
          {/* 기본 정보 섹션 */}
          <section className="form-section">
            <h2 className="section-title">
              <span className="section-number">1</span>
              기본 정보
            </h2>

            <div className="form-group">
              <label htmlFor="title" className="required">
                제목
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="예) 48시간이 모자른 부산 빵지순례"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="region">지역</label>
                <input
                  type="text"
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  placeholder="예) 부산"
                />
              </div>

              <div className="form-group">
                <label htmlFor="duration">기간</label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="예) 1박2일"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="distance">총 거리</label>
                <input
                  type="text"
                  id="distance"
                  name="distance"
                  value={formData.distance}
                  onChange={handleInputChange}
                  placeholder="예) 39.6km"
                />
              </div>

              <div className="form-group">
                <label htmlFor="travelTime">이동 시간</label>
                <input
                  type="text"
                  id="travelTime"
                  name="travelTime"
                  value={formData.travelTime}
                  onChange={handleInputChange}
                  placeholder="예) 1시간 24분"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">소개</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="이 빵지순례에 대해 소개해주세요"
                rows={4}
              />
            </div>

            <div className="form-group">
              <label htmlFor="author">작성자</label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                placeholder="닉네임을 입력해주세요"
              />
            </div>
          </section>

          {/* 빵집 목록 섹션 */}
          <section className="form-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-number">2</span>
                빵집 목록
              </h2>
              <button
                type="button"
                onClick={addBakery}
                className="add-bakery-btn"
              >
                + 빵집 추가
              </button>
            </div>

            {bakeries.map((bakery, index) => (
              <div key={bakery.id} className="bakery-form-card">
                <div className="bakery-card-header">
                  <h3>
                    <span className="bakery-number">{index + 1}</span>
                    빵집 정보
                  </h3>
                  {bakeries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBakery(index)}
                      className="remove-bakery-btn"
                    >
                      삭제
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label className="required">빵집 이름</label>
                  <input
                    type="text"
                    value={bakery.name}
                    onChange={(e) =>
                      handleBakeryChange(index, "name", e.target.value)
                    }
                    placeholder="예) 배롱산"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>주소</label>
                  <input
                    type="text"
                    value={bakery.address}
                    onChange={(e) =>
                      handleBakeryChange(index, "address", e.target.value)
                    }
                    placeholder="예) 부산 해운대구 중동"
                  />
                </div>

                <div className="form-group">
                  <label>설명</label>
                  <textarea
                    value={bakery.description}
                    onChange={(e) =>
                      handleBakeryChange(index, "description", e.target.value)
                    }
                    placeholder="이 빵집에 대해 간단히 설명해주세요"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <div className="menu-header">
                    <label>추천 메뉴</label>
                    <button
                      type="button"
                      onClick={() => addMenu(index)}
                      className="add-menu-btn"
                    >
                      + 메뉴 추가
                    </button>
                  </div>

                  {bakery.menu.map((menu, menuIndex) => (
                    <div key={menuIndex} className="menu-input-wrapper">
                      <input
                        type="text"
                        value={menu}
                        onChange={(e) =>
                          handleMenuChange(index, menuIndex, e.target.value)
                        }
                        placeholder="예) 크루아상 4,500원"
                      />
                      {bakery.menu.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMenu(index, menuIndex)}
                          className="remove-menu-btn"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* 제출 버튼 */}
          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="cancel-btn">
              취소
            </button>
            <button type="submit" className="submit-btn">
              {isEditMode ? "수정하기" : "등록하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BakeryTourForm;
