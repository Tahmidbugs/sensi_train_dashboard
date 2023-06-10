import React, { useState } from "react";

function Post({ post }) {
  const [isAnnotationMode, setIsAnnotationMode] = useState(false);
  const [annotations, setAnnotations] = useState([]);

  const handleAnnotateClick = () => {
    setIsAnnotationMode(true);
  };

  const handleAnnotation = (annotation) => {
    setAnnotations([...annotations, annotation]);
    setIsAnnotationMode(false);
  };

  return (
    <div className="post">
      <img src={post.imageUrl} alt="Post" />
      <p>{post.caption}</p>
      <button onClick={handleAnnotateClick}>Annotate</button>
      {isAnnotationMode && (
        <AnnotationOverlay onAnnotation={handleAnnotation} />
      )}
      {annotations.map((annotation, index) => (
        <Annotation key={index} annotation={annotation} />
      ))}
    </div>
  );
}
