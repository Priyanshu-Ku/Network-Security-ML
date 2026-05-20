import React, { useRef, useState } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const FileUpload = ({ onFileSelect, accept = ".csv", disabled = false }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Validate file type against accept prop
  const isFileTypeValid = (file) => {
    if (!accept) return true;
    const acceptedTypes = accept.split(",").map((t) => t.trim().toLowerCase());
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();

    return acceptedTypes.some((accepted) => {
      if (accepted.startsWith(".")) {
        return fileName.endsWith(accepted);
      }
      if (accepted.includes("*")) {
        const [mainType] = accepted.split("/");
        return fileType.startsWith(mainType + "/");
      }
      return fileType === accepted;
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!isFileTypeValid(file)) {
        setFileError(`Invalid file type. Accepted: ${accept}`);
        return;
      }
      handleFile(file);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    setFileError(null);

    if (file.size > MAX_FILE_SIZE) {
      setFileError(
        `File size exceeds 10MB limit. Selected: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
      );
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div>
      <div
        style={{
          ...styles.dropzone,
          borderColor: dragActive ? "#3b82f6" : "#cbd5e1",
          backgroundColor: dragActive ? "#eff6ff" : "#f8fafc",
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
          outline: "none",
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-disabled={disabled}
        aria-label="File upload dropzone"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          style={{ display: "none" }}
          disabled={disabled}
        />
        <div style={styles.icon}>📤</div>
        {selectedFile ? (
          <div style={styles.selectedFile}>
            <span style={styles.fileName}>{selectedFile.name}</span>
            <span style={styles.fileSize}>
              ({(selectedFile.size / 1024).toFixed(1)} KB)
            </span>
          </div>
        ) : (
          <>
            <p style={styles.text}>
              Drag and drop a CSV file here, or click to select
            </p>
            <p style={styles.subtext}>Maximum file size: 10MB</p>
          </>
        )}
      </div>
      {fileError && <p style={styles.errorText}>{fileError}</p>}
    </div>
  );
};

const styles = {
  dropzone: {
    border: "2px dashed",
    borderRadius: "12px",
    padding: "40px",
    textAlign: "center",
    transition: "all 0.2s",
  },
  icon: {
    fontSize: "48px",
    marginBottom: "15px",
  },
  text: {
    fontSize: "16px",
    color: "#475569",
    margin: "0 0 8px",
  },
  subtext: {
    fontSize: "14px",
    color: "#94a3b8",
    margin: 0,
  },
  selectedFile: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  fileName: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#1e293b",
  },
  fileSize: {
    fontSize: "14px",
    color: "#64748b",
  },
  errorText: {
    marginTop: "10px",
    color: "#dc2626",
    fontSize: "14px",
    textAlign: "center",
  },
};

export default FileUpload;
