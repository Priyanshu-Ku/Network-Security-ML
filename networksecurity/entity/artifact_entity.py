from dataclasses import dataclass

@dataclass
class DataIngestionArtifact:
    trained_file_path: str
    test_file_path: str
    
## Output of the Data Ingestion Component is Data Ingestion Artifact 
## which contains the train and test file path

@dataclass
class DataValidationArtifact:
    validation_status: bool
    valid_train_file_path: str
    valid_test_file_path: str
    invalid_train_file_path: str
    invalid_test_file_path: str
    drift_report_file_path: str
    
## Output of the Data Validation Component is Data Validation Artifact 
## which contains the validation status 
## and file paths to valid and invalid train and test data along with the drift report file path

@dataclass
class DataTransformationArtifact:
    transformed_object_file_path: str
    transformed_train_file_path: str 
    transformed_test_file_path: str 
    
## Output of the Data Transformation Component is Data Transformation Artifact
## which contains the file paths to transformed train and test data along with the transformed object file path

@dataclass 
class ClassificationMetricArtifact:
    f1_score: float
    precision_score: float
    recall_score: float
    
@dataclass 
class ModelTrainerArtifact:
    trained_model_file_path: str
    train_metric_artifact: ClassificationMetricArtifact
    test_metric_artifact: ClassificationMetricArtifact
    
## Output of the Model Trainer Component is Model Trainer Artifact
## which contains the file path to the trained model along with the classification metrics for both train and test data