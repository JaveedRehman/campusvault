import React, { useState } from 'react';
import { AcademicResource } from '../types/repository';
import { submitRating } from '../lib/repositoryService';
import { getAnonymousIdentifier } from '../lib/firebase';

interface DetailViewProps {
  resource: AcademicResource;
  onBack: () => void;
  onUpdateResource: (updated: AcademicResource) => void;
}

export const DetailView: React.FC<DetailViewProps> = ({
  resource,
  onBack,
  onUpdateResource
}) => {
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingSuccessMsg, setRatingSuccessMsg] = useState<string | null>(null);
  const [ratingErrMsg, setRatingErrMsg] = useState<string | null>(null);

  const anonId = getAnonymousIdentifier();
  const alreadyRatedKey = `rated_${resource.id}`;
  const userHasRatedLocally = localStorage.getItem(alreadyRatedKey) === 'true';

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resource.id) return;

    if (userHasRatedLocally) {
      setRatingErrMsg('You have already submitted a rating for this document from this browser session.');
      return;
    }

    setIsSubmittingRating(true);
    setRatingErrMsg(null);
    setRatingSuccessMsg(null);

    try {
      const { newAverage, newCount } = await submitRating(
        resource.id,
        anonId,
        selectedRating,
        resource.isSample
      );

      localStorage.setItem(alreadyRatedKey, 'true');

      const updatedRes: AcademicResource = {
        ...resource,
        averageRating: newAverage,
        ratingCount: newCount
      };

      onUpdateResource(updatedRes);
      setRatingSuccessMsg(`Thank you! Your rating of ${selectedRating} star(s) has been recorded.`);
    } catch (err: any) {
      console.error(err);
      setRatingErrMsg(err.message || 'Failed to submit rating. Please try again.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const fileDownloadUrl = resource.fileUrl || `/api/download/${resource.fileKey}`;
  const directDownloadUrl = `${fileDownloadUrl}${fileDownloadUrl.includes('?') ? '&' : '?'}download=true`;

  return (
    <div style={{ fontFamily: 'Arial, Verdana, sans-serif', fontSize: '13px' }}>

      {/* Back Button */}
      <div style={{ marginBottom: '12px' }}>
        <button
          onClick={onBack}
          style={{
            backgroundColor: '#eeeeee',
            border: '1px solid #666666',
            padding: '3px 8px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          &laquo; Return to Document Index / Catalog
        </button>
      </div>

      {/* Document Details Fieldset */}
      <fieldset style={{ border: '1px solid #777777', padding: '12px', marginBottom: '15px', backgroundColor: '#ffffff' }}>
        <legend style={{ fontWeight: 'bold', fontSize: '13px', padding: '0 5px' }}>
          Document Record File Entry
        </legend>

        <h2 style={{ fontFamily: 'Times New Roman, serif', fontSize: '20px', margin: '0 0 10px 0', color: '#000066' }}>
          {resource.title}
        </h2>

        <table border={1} cellPadding={6} cellSpacing={0} style={{ width: '100%', borderCollapse: 'collapse', borderColor: '#888888', marginBottom: '12px' }}>
          <tbody>
            <tr>
              <td style={{ width: '22%', backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>Academic College:</td>
              <td style={{ width: '78%' }}>{resource.college}</td>
            </tr>
            <tr>
              <td style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>Department:</td>
              <td>{resource.department}</td>
            </tr>
            <tr>
              <td style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>Semester Level:</td>
              <td>{resource.semester}</td>
            </tr>
            <tr>
              <td style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>Course Subject:</td>
              <td><strong>{resource.subject}</strong></td>
            </tr>
            <tr>
              <td style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>Document Description:</td>
              <td style={{ fontStyle: resource.description ? 'normal' : 'italic', color: resource.description ? '#000' : '#666' }}>
                {resource.description || 'No detailed description provided.'}
              </td>
            </tr>
            <tr>
              <td style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>Submitted By:</td>
              <td>{resource.uploadedByName || resource.uploadedByEmail || 'University Member'}</td>
            </tr>
            <tr>
              <td style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>Date Indexed:</td>
              <td>{new Date(resource.uploadedAt).toLocaleString()}</td>
            </tr>
            <tr>
              <td style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>File Metadata:</td>
              <td>
                Filename: <code>{resource.fileName || resource.fileKey}</code> |
                Size: {resource.fileSize ? `${(resource.fileSize / 1024).toFixed(1)} KB` : 'Unknown'}
              </td>
            </tr>
            <tr>
              <td style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>Community Rating:</td>
              <td>
                {resource.ratingCount > 0 ? (
                  <span style={{ fontWeight: 'bold' }}>
                    ★ {resource.averageRating} out of 5 stars ({resource.ratingCount} rating{resource.ratingCount > 1 ? 's' : ''})
                  </span>
                ) : (
                  <span style={{ color: '#666' }}>Not yet rated. Be the first to submit a rating below!</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Download Link Block */}
        <div style={{ backgroundColor: '#e6f2ff', border: '1px solid #0044cc', padding: '10px', textAlign: 'center', marginBottom: '12px' }}>
          <strong style={{ fontSize: '14px', color: '#002288', display: 'block', marginBottom: '4px' }}>
            Available PDF File Download:
          </strong>
          <a
            href={directDownloadUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              backgroundColor: '#003399',
              color: '#ffffff',
              padding: '6px 14px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontFamily: 'Arial, sans-serif',
              fontSize: '13px',
              display: 'inline-block',
              border: '1px solid #001155'
            }}
          >
            [ Download PDF Document ({resource.fileName || 'file.pdf'}) ]
          </a>
          <div style={{ fontSize: '11px', color: '#444444', marginTop: '4px' }}>
            No registration or sign-in required to download documents.
          </div>
        </div>
      </fieldset>

      {/* 1-5 Star Rating Form */}
      <fieldset style={{ border: '1px solid #777777', padding: '12px', marginBottom: '15px', backgroundColor: '#fafafa' }}>
        <legend style={{ fontWeight: 'bold', fontSize: '12px', padding: '0 5px' }}>
          Rate Document Quality (1 - 5 Stars)
        </legend>

        {ratingSuccessMsg ? (
          <div style={{ backgroundColor: '#e6ffe6', border: '1px solid #008800', color: '#006600', padding: '8px', fontWeight: 'bold', fontSize: '12px' }}>
            {ratingSuccessMsg}
          </div>
        ) : (
          <form onSubmit={handleRatingSubmit} style={{ margin: 0 }}>
            <p style={{ margin: '0 0 6px 0', fontSize: '12px' }}>
              Select your rating rating score for this academic resource (no sign-in required):
            </p>

            <div style={{ margin: '6px 0' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <label key={star} style={{ marginRight: '12px', cursor: 'pointer', fontWeight: selectedRating === star ? 'bold' : 'normal' }}>
                  <input
                    type="radio"
                    name="starRating"
                    value={star}
                    checked={selectedRating === star}
                    onChange={() => setSelectedRating(star)}
                    style={{ marginRight: '3px' }}
                  />
                  {'★'.repeat(star)} ({star} Star{star > 1 ? 's' : ''})
                </label>
              ))}
            </div>

            <div style={{ marginTop: '8px' }}>
              <button
                type="submit"
                disabled={isSubmittingRating || userHasRatedLocally}
                style={{
                  backgroundColor: userHasRatedLocally ? '#e0e0e0' : '#f0f0f0',
                  border: '1px solid #555555',
                  padding: '4px 12px',
                  fontSize: '12px',
                  cursor: userHasRatedLocally ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmittingRating ? 'Submitting Rating...' : userHasRatedLocally ? 'Already Rated' : '[ Submit Star Rating ]'}
              </button>
              {userHasRatedLocally && (
                <span style={{ fontSize: '11px', color: '#666', marginLeft: '10px' }}>
                  (You have already submitted a rating for this document)
                </span>
              )}
            </div>

            {ratingErrMsg && (
              <div style={{ color: '#cc0000', marginTop: '6px', fontSize: '12px' }}>
                {ratingErrMsg}
              </div>
            )}
          </form>
        )}
      </fieldset>

      {/* PDF Document Preview Box */}
      <fieldset style={{ border: '1px solid #777777', padding: '12px' }}>
        <legend style={{ fontWeight: 'bold', fontSize: '12px', padding: '0 5px' }}>
          Document Viewer Frame
        </legend>
        <div style={{ border: '1px solid #999999', height: '480px', backgroundColor: '#eef2f5' }}>
          <iframe
            src={fileDownloadUrl}
            title={resource.title}
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      </fieldset>

    </div>
  );
};
