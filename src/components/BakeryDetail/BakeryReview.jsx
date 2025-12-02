import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import BakeryReviewWrite from "./BakeryReviewWrite";
import "./BakeryReview.css";

function BakeryReview({ reviews }) {
  const { bakeryId } = useParams();
  const [isWriting, setIsWriting] = useState(false);
  const [localReviews, setLocalReviews] = useState(reviews ?? []);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLocalReviews(reviews ?? []);
    setEditingReviewId(null);
    setEditingContent("");
  }, [reviews]);

  const handleEditClick = (reviewId, text = "") => {
    setEditingReviewId(reviewId);
    setEditingContent(text);
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditingContent("");
  };

  const handleSave = async (reviewId) => {
    const trimmed = editingContent.trim();
    if (!trimmed) {
      alert("내용을 입력해주세요.");
      return;
    }

    const targetReview = localReviews.find(
      (review) => (review.review_id || review.id) === reviewId,
    );
    if (!targetReview) {
      alert("리뷰 정보를 찾을 수 없습니다.");
      return;
    }
    try {
      setSubmitting(true);
      await axios.patch(
        `/api/bakery-reviews/${reviewId}`,
        {
          text: trimmed,
          rating: targetReview.rating,
          photo: targetReview.photo,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        },
      );
      setLocalReviews((prev) =>
        prev.map((review) =>
          (review.review_id || review.id) === reviewId
            ? { ...review, content: trimmed, text: trimmed }
            : review,
        ),
      );
      handleCancelEdit();
      alert("리뷰가 수정되었습니다.");
    } catch (error) {
      alert(error.response?.data?.message || "리뷰를 수정하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("리뷰를 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/api/bakery-reviews/${reviewId}`, {
        withCredentials: true,
      });
      setLocalReviews((prev) =>
        prev.filter((review) => (review.review_id || review.id) !== reviewId),
      );
    } catch (error) {
      alert(error.response?.data?.message || "리뷰를 삭제하지 못했습니다.");
    }
  };

  if (isWriting) {
    return (
      <BakeryReviewWrite
        bakeryId={bakeryId}
        onCancel={() => setIsWriting(false)}
        onSubmitSuccess={() => setIsWriting(false)}
      />
    );
  }

  if (!localReviews || localReviews.length === 0) {
    return (
      <div className="bakery-review-wrapper">
        <Toolbar onWriteClick={() => setIsWriting(true)} />
        <div className="bakery-review-empty">등록된 리뷰가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="bakery-review-wrapper">
      <Toolbar onWriteClick={() => setIsWriting(true)} />
      <div className="bakery-review-list">
        {localReviews.map((review) => {
          const reviewId = review.review_id || review.id;
          const isEditing = editingReviewId === reviewId;
          return (
            <div key={reviewId || `${review.writer}-${review.date}`} className="bakery-review-item">
              <div className="bakery-review-header">
                <div className="bakery-review-user">
                  <div className="bakery-review-avatar">👤</div>
                  <span className="bakery-review-name">{review.userName || review.writer}</span>
                </div>
                <div className="bakery-review-actions">
                  <button type="button" onClick={() => handleEditClick(reviewId, review.content || review.text)}>
                    수정
                  </button>
                  <span>|</span>
                  <button type="button" onClick={() => handleDelete(reviewId)}>
                    삭제
                  </button>
                </div>
              </div>

              {review.photo && (
                <div className="bakery-review-photo">
                  <img src={review.photo} alt="리뷰 사진" />
                </div>
              )}

              {isEditing ? (
                <div className="bakery-review-edit">
                  <textarea
                    value={editingContent}
                    onChange={(event) => setEditingContent(event.target.value)}
                    rows={4}
                  />
                  <div className="bakery-review-edit-actions">
                    <button type="button" onClick={handleCancelEdit} disabled={submitting}>
                      취소
                    </button>
                    <button type="button" onClick={() => handleSave(reviewId)} disabled={submitting}>
                      {submitting ? "저장 중..." : "저장"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bakery-review-text">{review.content || review.text}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Toolbar({ onWriteClick }) {
  return (
    <div className="bakery-review-toolbar">
      <button type="button" onClick={onWriteClick}>
        리뷰 작성
      </button>
    </div>
  );
}

export default BakeryReview;
