import React from 'react';
import './BakeryMenu.css';

function BakeryMenu({ menus }) {
  if (!menus || menus.length === 0) {
    return <div className="bakery-menu-empty">등록된 메뉴가 없습니다.</div>;
  }

  return (
    <div className="bakery-menu-list">
      {menus.map((menu) => (
        <div key={menu.id || menu.menuId} className="bakery-menu-item">
          <div className="bakery-menu-info">
            <div className="bakery-menu-title-row">
              <span className="bakery-menu-name">{menu.name}</span>
              <span className="bakery-menu-rating">⭐ {formatRating(menu.rating)}</span>
            </div>
            {menu.description && <p className="bakery-menu-desc">{menu.description}</p>}
            <div className="bakery-menu-price">{formatPrice(menu.price)}</div>
            <button
              type="button"
              className="bakery-menu-review-link"
              aria-label={`${menu.name} 리뷰 보기`}
            >
              메뉴 리뷰 {formatNumber(menu.count ?? menu.reviewCount ?? 0)} &gt;
            </button>
          </div>
          {getMenuImage(menu) && (
            <div className="bakery-menu-image">
              <img src={getMenuImage(menu)} alt={`${menu.name} 사진`} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function getMenuImage(menu = {}) {
  return (
    menu.imageUrl ||
    menu.photo ||
    menu.photoUrl ||
    menu.thumbnail ||
    menu.photo1 ||
    null
  );
}

function formatRating(value) {
  if (value === null || value === undefined) return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return '-';
  return num.toFixed(1);
}

function formatNumber(value) {
  if (value === null || value === undefined) return '0';
  return new Intl.NumberFormat('ko-KR').format(value);
}

function formatPrice(value) {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'number') {
    return `${new Intl.NumberFormat('ko-KR').format(value)}원`;
  }
  return value;
}

export default BakeryMenu;

