import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axiosConfig"; // ✅ axios 대신 api import
import BakeryReviewWrite from "./BakeryReviewWrite";
import "./BakeryReview.css";

const REVIEW_ID_KEYS = [
  "reviewId",
  "ReviewId",
  "reviewID",
  "ReviewID",
  "review_id",
  "bakeryReviewId",
  "BakeryReviewId",
  "bakeryReviewID",
  "BakeryReviewID",
  "bakery_review_id",
];

const normalizeReviewId = (value) => {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim();
  return normalized || null;
};

const getReviewIdFromObject = (review) => {
  if (!review || typeof review !== "object") return null;

  for (const key of REVIEW_ID_KEYS) {
    const candidate = normalizeReviewId(review[key]);
    if (candidate) return candidate;
  }

  return null;
};

const buildReviewMatchKey = (bakeryIdValue, textValue, dateValue) => {
  const bakeryPart = normalizeReviewId(bakeryIdValue) || "";
  const textPart = (textValue ?? "").toString().trim();
  const datePart = (dateValue ?? "").toString().trim();

  if (!bakeryPart && !textPart) return null;
  return `${bakeryPart}::${textPart}::${datePart}`;
};

function BakeryReview({ reviews }) {
  const { bakeryId } = useParams();
  const [isWriting, setIsWriting] = useState(false);
  const [localReviews, setLocalReviews] = useState(reviews ?? []);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewIdMap, setReviewIdMap] = useState({});

  useEffect(() => {
    setLocalReviews(reviews ?? []);
    setEditingReviewId(null);
    setEditingContent("");
  }, [reviews]);

  useEffect(() => {
    let isMounted = true;
    const isLoggedIn =
      typeof window !== "undefined" &&
      window.localStorage?.getItem("isLoggedIn") === "true";

    if (!isLoggedIn) {
      setReviewIdMap({});
      return undefined;
    }

    const fetchMyBakeryReviews = async () => {
      try {
        const response = await api.get("/api/members/me/bakery-reviews");
        const payload = response.data?.data ?? response.data ?? [];
        if (!Array.isArray(payload)) return;

        const nextMap = {};
        payload.forEach((item) => {
          const normalizedId = normalizeReviewId(
            item.reviewId ??
              item.bakeryReviewId ??
              item.review_id ??
              item.id
          );
          if (!normalizedId) return;

          const bakeryKey =
            normalizeReviewId(
              item.bakeryId ?? item.bakery_id ?? item.bakery?.id
            ) || "";
          const matchKey = buildReviewMatchKey(
            bakeryKey,
            item.text ?? item.content ?? "",
            item.date ?? item.createdAt ?? ""
          );
          if (matchKey) {
            nextMap[matchKey] = normalizedId;
          }
        });

        if (isMounted) {
          setReviewIdMap(nextMap);
        }
      } catch (error) {
        console.error("내가 작성한 리뷰 목록 불러오기 실패:", error);
      }
    };

    fetchMyBakeryReviews();

    return () => {
      isMounted = false;
    };
  }, [bakeryId]);

  const resolveReviewId = useCallback(
    (review) => {
      const directId = getReviewIdFromObject(review);
      if (directId) return directId;

      const candidateKeys = [];
      const primaryKey = buildReviewMatchKey(
        review?.bakeryId ??
          review?.bakery_id ??
          review?.bakery?.id ??
          bakeryId,
        review?.text ?? review?.content ?? "",
        review?.date ?? review?.createdAt ?? ""
      );
      if (primaryKey) candidateKeys.push(primaryKey);

      const fallbackKey = buildReviewMatchKey(
        review?.bakeryId ??
          review?.bakery_id ??
          review?.bakery?.id ??
          bakeryId,
        review?.text ?? review?.content ?? "",
        ""
      );
      if (fallbackKey) candidateKeys.push(fallbackKey);

      for (const key of candidateKeys) {
        const mapped = reviewIdMap[key];
        if (mapped) return mapped;
      }

      return null;
    },
    [bakeryId, reviewIdMap]
  );

  const handleEditClick = (reviewId, text = "") => {
    const resolvedId = normalizeReviewId(reviewId);
    if (!resolvedId) {
      alert("리뷰 ID를 찾을 수 없어 수정할 수 없습니다.");
      return;
    }
    setEditingReviewId(resolvedId);
    setEditingContent(text);
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditingContent("");
  };

  const handleSave = async (reviewId) => {
    const resolvedId = normalizeReviewId(reviewId);
    if (!resolvedId) {
      alert("리뷰 ID를 확인할 수 없어 수정할 수 없습니다.");
      return;
    }
    const trimmed = editingContent.trim();
    if (!trimmed) {
      alert("내용을 입력해주세요.");
      return;
    }

    const targetReview = localReviews.find(
      (review) => resolveReviewId(review) === resolvedId
    );
    if (!targetReview) {
      alert("리뷰 정보를 찾을 수 없습니다.");
      return;
    }
    try {
      setSubmitting(true);

      // ✅ api.patch 사용
      await api.patch(`/api/bakery-reviews/${resolvedId}`, {
        text: trimmed,
        rating: targetReview.rating,
        photo: targetReview.photo,
      });

      setLocalReviews((prev) =>
        prev.map((review) => {
          const currentId = resolveReviewId(review);
          return currentId === resolvedId
            ? {
                ...review,
                reviewId: resolvedId,
                content: trimmed,
                text: trimmed,
              }
            : review;
        })
      );
      handleCancelEdit();
      alert("리뷰가 수정되었습니다.");
    } catch (error) {
      console.error("리뷰 수정 실패:", error);

      // ✅ 401은 인터셉터에서 자동 처리
      if (error.response?.status !== 401) {
        alert(error.response?.data?.message || "리뷰를 수정하지 못했습니다.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("리뷰를 삭제하시겠습니까?")) return;
    const resolvedId = normalizeReviewId(reviewId);
    if (!resolvedId) {
      alert("리뷰 ID를 확인할 수 없어 삭제할 수 없습니다.");
      return;
    }

    try {
      // ✅ api.delete 사용
      await api.delete(`/api/bakery-reviews/${resolvedId}`);

      setLocalReviews((prev) =>
        prev.filter((review) => resolveReviewId(review) !== resolvedId)
      );

      alert("리뷰가 삭제되었습니다.");
    } catch (error) {
      console.error("리뷰 삭제 실패:", error);

      // ✅ 401은 인터셉터에서 자동 처리
      if (error.response?.status !== 401) {
        alert(error.response?.data?.message || "리뷰를 삭제하지 못했습니다.");
      }
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
        {localReviews.map((review, index) => {
          const reviewId = resolveReviewId(review);
          const isEditing =
            editingReviewId !== null && editingReviewId === reviewId;
          const reviewKey =
            reviewId || `${review.writer || "review"}-${review.date || index}`;
          return (
            <div
              key={reviewKey}
              className="bakery-review-item"
            >
              <div className="bakery-review-header">
                <div className="bakery-review-user">
                  <div className="bakery-review-avatar">👤</div>
                  <span className="bakery-review-name">
                    {review.userName || review.writer}
                  </span>
                </div>
                <div className="bakery-review-actions">
                  <button
                    type="button"
                    onClick={() =>
                      handleEditClick(reviewId, review.content || review.text)
                    }
                  >
                    수정
                  </button>
                  <span>|</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(reviewId)}
                  >
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
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={submitting}
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSave(reviewId)}
                      disabled={submitting}
                    >
                      {submitting ? "저장 중..." : "저장"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bakery-review-text">
                  {review.content || review.text}
                </div>
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
