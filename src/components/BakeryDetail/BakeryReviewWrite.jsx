import React, { useState } from "react";
import axios from "axios";
import "./BakeryReviewWrite.css";

function BakeryReviewWrite({ bakeryId, onCancel, onSubmitSuccess }) {
  const [content, setContent] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    const payload = {
      rating: 5,
      text: content.trim(),
      photo: photoUrl.trim() || null,
    };

    if (!payload.text) {
      setError("리뷰 내용을 입력해주세요.");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(`http://43.200.233.19/api/bakeries/${bakeryId}/bakery-reviews`, payload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      alert("리뷰가 저장되었습니다.");
      onSubmitSuccess?.();
    } catch (submitError) {
      setError(submitError.response?.data?.message || "리뷰 저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="bakery-review-write" onSubmit={handleSubmit}>
      <div className="bakery-review-write__bar">
        <button type="button" onClick={onCancel} className="secondary">
          ← 목록으로
        </button>
        <h2>리뷰 작성</h2>
        <button type="submit" disabled={submitting}>
          {submitting ? "저장 중..." : "등록"}
        </button>
      </div>

      <label className="bakery-review-field">
        <span>리뷰 내용</span>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="가게에 대한 솔직한 후기를 남겨주세요."
          rows={6}
        />
      </label>

      <label className="bakery-review-field">
        <span>사진 URL (선택)</span>
        <input
          type="url"
          value={photoUrl}
          onChange={(event) => setPhotoUrl(event.target.value)}
          placeholder="https://example.com/photo.jpg"
        />
      </label>

      {error && <p className="bakery-review-error">{error}</p>}
    </form>
  );
}

export default BakeryReviewWrite;

