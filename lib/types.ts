export type Dataset = {
  id: number;
  name: string;
  description: string;
  csv_content: string;
  created_at: string;
};

export type DatasetSummary = {
  id: number;
  name: string;
  description: string;
};

export type ChartType = "bar" | "line" | "pie";

export type Submission = {
  id: number;
  student_id: number;
  title: string;
  dataset_name: string;
  chart_type: ChartType;
  chart_data_url: string;
  analysis_text: string;
  score: number | null;
  feedback: string | null;
  created_at: string;
  graded_at: string | null;
};

export type SubmissionOwnerView = {
  id: number;
  title: string;
  dataset_name: string;
  chart_type: ChartType;
  analysis_text: string;
  score: number | null;
  feedback: string | null;
  created_at: string;
};

export type SubmissionAdminRow = Submission & {
  class_code: string;
  student_no: string;
  student_name: string;
};
