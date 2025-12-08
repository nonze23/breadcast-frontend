import React, { useState, useRef } from "react";
import api from "../../api/axiosConfig"; // ✅ axios 대신 api import
import "./BakeryReviewWrite.css";

function BakeryReviewWrite({ bakeryId, onCancel, onSubmitSuccess }) {
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // 파일 선택 핸들러
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // 파일 타입 검증 (이미지 파일만 허용)
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드 가능합니다.");
      return;
    }

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("파일 크기는 10MB 이하여야 합니다.");
      return;
    }

    setSelectedFile(file);
    setError(null);

    // 미리보기 URL 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // 파일 제거 핸들러
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError("리뷰 내용을 입력해주세요.");
      return;
    }

    try {
      setSubmitting(true);

      // 이미지 URL 발급 및 업로드
      let imageUrl = null;

      if (selectedFile) {
        // 1. Presigned URL 발급 요청
        const fileInfo = {
          files: [
            {
              fileName: selectedFile.name,
              contentType: selectedFile.type,
            },
          ],
        };

        const urlResponse = await api.post("/api/upload/presigned-urls", fileInfo);

        if (urlResponse.data?.success && urlResponse.data?.data?.urls?.length > 0) {
          const presignedUrlData = urlResponse.data.data.urls[0];
          const presignedUrl = presignedUrlData.presignedUrl;
          const finalUrl = presignedUrlData.finalUrl;

          // 2. Presigned URL로 실제 파일 업로드
          if (presignedUrl) {
            try {
              const uploadResponse = await fetch(presignedUrl, {
                method: "PUT",
                body: selectedFile,
                headers: {
                  "Content-Type": selectedFile.type,
                },
              });

              if (uploadResponse.ok) {
                // 업로드 성공 시 최종 URL 저장
                imageUrl = finalUrl;
              } else {
                const errorText = await uploadResponse.text();
                console.error("파일 업로드 실패:", uploadResponse.status, errorText);
                setError(
                  `파일 업로드에 실패했습니다. (상태: ${uploadResponse.status})`
                );
                return;
              }
            } catch (uploadError) {
              console.error("파일 업로드 에러:", uploadError);
              
              // CORS 에러 감지
              if (
                uploadError.message?.includes("CORS") ||
                uploadError.message?.includes("Failed to fetch") ||
                uploadError.name === "TypeError"
              ) {
                setError(
                  "CORS 정책으로 인해 파일 업로드가 차단되었습니다. S3 버킷의 CORS 설정을 확인해주세요. (개발 환경에서는 백엔드 팀에 문의하세요)"
                );
              } else {
                setError(
                  `파일 업로드 중 오류가 발생했습니다: ${uploadError.message}`
                );
              }
              return;
            }
          }
        } else {
          console.error("Presigned URL 발급 실패");
          setError("파일 업로드 준비에 실패했습니다. 다시 시도해주세요.");
          return;
        }
      }

      // 3. 리뷰 생성 요청
      const payload = {
        text: content.trim(),
        photo: imageUrl || null,
      };

      await api.post(`/api/bakeries/${bakeryId}/bakery-reviews`, payload);

      alert("리뷰가 저장되었습니다.");
      onSubmitSuccess?.();
    } catch (submitError) {
      console.error("리뷰 저장 실패:", submitError);

      // ✅ 401은 인터셉터에서 자동 처리
      if (submitError.response?.status !== 401) {
        // fetch 에러인 경우 (CORS 등)
        if (submitError.name === "TypeError" && submitError.message?.includes("fetch")) {
          setError(
            "네트워크 오류가 발생했습니다. 파일 업로드가 실패했거나 서버에 연결할 수 없습니다."
          );
        } else {
          setError(
            submitError.response?.data?.message || "리뷰 저장에 실패했습니다."
          );
        }
      }
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
        <span>사진 첨부 (선택)</span>
        <div className="file-upload-section">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
            id="photo-upload"
          />
          <label htmlFor="photo-upload" className="file-upload-button">
            {selectedFile ? "파일 변경" : "파일 선택"}
          </label>
          {selectedFile && (
            <button
              type="button"
              onClick={handleRemoveFile}
              className="file-remove-button"
            >
              제거
            </button>
          )}
        </div>
        {selectedFile && (
          <div className="file-info">
            <p>선택된 파일: {selectedFile.name}</p>
            <p className="file-size">
              크기: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}
        {previewUrl && (
          <div className="image-preview">
            <img src={previewUrl} alt="미리보기" />
          </div>
        )}
      </label>

      {error && <p className="bakery-review-error">{error}</p>}
    </form>
  );
}

export default BakeryReviewWrite;
