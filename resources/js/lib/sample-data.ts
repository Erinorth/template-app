import type { 
  OrganizationalRisk, 
  DivisionRisk, 
  RiskAssessment,
  LikelihoodCriteria,
  ImpactCriteria 
} from '@/types/risk-assessment';

// ข้อมูลสมมติสำหรับ Organizational Risks
export const sampleOrganizationalRisks: OrganizationalRisk[] = [
  {
    id: 1,
    risk_name: "ความเสี่ยงด้านการเงิน",
    description: "ความเสี่ยงจากการเปลี่ยนแปลงของอัตราแลกเปลี่ยนและอัตราดอกเบี้ย",
    created_at: "2024-01-15T08:00:00Z",
    updated_at: "2024-01-15T08:00:00Z"
  },
  {
    id: 2,
    risk_name: "ความเสี่ยงด้านไซเบอร์",
    description: "ความเสี่ยงจากการโจมตีทางไซเบอร์และการรั่วไหลของข้อมูล",
    created_at: "2024-01-20T09:30:00Z",
    updated_at: "2024-01-20T09:30:00Z"
  },
  {
    id: 3,
    risk_name: "ความเสี่ยงด้านสิ่งแวดล้อม",
    description: "ความเสี่ยงจากการเปลี่ยนแปลงสภาพภูมิอากาศและนโยบายสิ่งแวดล้อม",
    created_at: "2024-02-01T10:15:00Z",
    updated_at: "2024-02-01T10:15:00Z"
  },
  {
    id: 4,
    risk_name: "ความเสี่ยงด้านปฏิบัติการ",
    description: "ความเสี่ยงจากการหยุดชะงักของระบบและกระบวนการทำงาน",
    created_at: "2024-02-10T11:00:00Z",
    updated_at: "2024-02-10T11:00:00Z"
  },
  {
    id: 5,
    risk_name: "ความเสี่ยงด้านกฎระเบียบ",
    description: "ความเสี่ยงจากการเปลี่ยนแปลงกฎหมายและข้อบังคับ",
    created_at: "2024-02-15T14:30:00Z",
    updated_at: "2024-02-15T14:30:00Z"
  }
];

// ข้อมูลสมมติสำหรับ Division Risks
export const sampleDivisionRisks: DivisionRisk[] = [
  {
    id: 1,
    risk_name: "ความเสี่ยงสภาพคล่องเงินสด",
    description: "ความเสี่ยงจากการขาดสภาพคล่องในการดำเนินงานประจำวัน",
    organizational_risk_id: 1,
    created_at: "2024-01-16T08:00:00Z",
    updated_at: "2024-01-16T08:00:00Z"
  },
  {
    id: 2,
    risk_name: "ความเสี่ยงจากการลงทุน",
    description: "ความเสี่ยงจากการลงทุนในโครงการใหม่และผลตอบแทนที่ไม่แน่นอน",
    organizational_risk_id: 1,
    created_at: "2024-01-17T09:00:00Z",
    updated_at: "2024-01-17T09:00:00Z"
  },
  {
    id: 3,
    risk_name: "ความเสี่ยงการรั่วไหลข้อมูล",
    description: "ความเสี่ยงจากการเข้าถึงข้อมูลโดยไม่ได้รับอนุญาต",
    organizational_risk_id: 2,
    created_at: "2024-01-21T10:00:00Z",
    updated_at: "2024-01-21T10:00:00Z"
  },
  {
    id: 4,
    risk_name: "ความเสี่ยงจากมัลแวร์",
    description: "ความเสี่ยงจากการติดไวรัสและมัลแวร์ในระบบคอมพิวเตอร์",
    organizational_risk_id: 2,
    created_at: "2024-01-22T11:00:00Z",
    updated_at: "2024-01-22T11:00:00Z"
  },
  {
    id: 5,
    risk_name: "ความเสี่ยงการปล่อยก๊าซเรือนกระจก",
    description: "ความเสี่ยงจากการปล่อยก๊าซเรือนกระจกที่เกินมาตรฐาน",
    organizational_risk_id: 3,
    created_at: "2024-02-02T08:30:00Z",
    updated_at: "2024-02-02T08:30:00Z"
  },
  {
    id: 6,
    risk_name: "ความเสี่ยงจากการจัดการของเสีย",
    description: "ความเสี่ยงจากการจัดการของเสียที่ไม่เหมาะสม",
    organizational_risk_id: 3,
    created_at: "2024-02-03T09:00:00Z",
    updated_at: "2024-02-03T09:00:00Z"
  }
];

// ข้อมูลสมมติสำหรับ Risk Assessments
export const sampleRiskAssessments: RiskAssessment[] = [
  {
    id: 1,
    assessment_year: 2024,
    assessment_period: 1,
    likelihood_level: 3,
    impact_level: 4,
    risk_score: 12,
    division_risk_id: 1,
    notes: "ได้ทำการประเมินเพิ่มเติมจากสถานการณ์ตลาดในไตรมาสแรก",
    created_at: "2024-03-01T08:00:00Z",
    updated_at: "2024-03-01T08:00:00Z"
  },
  {
    id: 2,
    assessment_year: 2024,
    assessment_period: 1,
    likelihood_level: 2,
    impact_level: 3,
    risk_score: 6,
    division_risk_id: 2,
    notes: "มีการควบคุมความเสี่ยงด้วยการสำรองเงินทุน",
    created_at: "2024-03-02T09:00:00Z",
    updated_at: "2024-03-02T09:00:00Z"
  },
  {
    id: 3,
    assessment_year: 2024,
    assessment_period: 1,
    likelihood_level: 4,
    impact_level: 4,
    risk_score: 16,
    division_risk_id: 3,
    notes: "ระดับความเสี่ยงสูงมาก ต้องเฝ้าระวังอย่างใกล้ชิด",
    created_at: "2024-03-03T10:00:00Z",
    updated_at: "2024-03-03T10:00:00Z"
  },
  {
    id: 4,
    assessment_year: 2024,
    assessment_period: 1,
    likelihood_level: 3,
    impact_level: 3,
    risk_score: 9,
    division_risk_id: 4,
    notes: "มีการอัพเดตระบบป้องกันไวรัสเป็นประจำ",
    created_at: "2024-03-04T11:00:00Z",
    updated_at: "2024-03-04T11:00:00Z"
  },
  {
    id: 5,
    assessment_year: 2024,
    assessment_period: 1,
    likelihood_level: 2,
    impact_level: 4,
    risk_score: 8,
    division_risk_id: 5,
    notes: "มีการตรวจสอบการปล่อยก๊าซเป็นประจำทุกเดือน",
    created_at: "2024-03-05T08:30:00Z",
    updated_at: "2024-03-05T08:30:00Z"
  },
  {
    id: 6,
    assessment_year: 2024,
    assessment_period: 2,
    likelihood_level: 2,
    impact_level: 3,
    risk_score: 6,
    division_risk_id: 1,
    notes: "สถานการณ์ดีขึ้นในไตรมาสที่สอง",
    created_at: "2024-06-01T08:00:00Z",
    updated_at: "2024-06-01T08:00:00Z"
  },
  {
    id: 7,
    assessment_year: 2024,
    assessment_period: 2,
    likelihood_level: 1,
    impact_level: 2,
    risk_score: 2,
    division_risk_id: 2,
    notes: "ระดับความเสี่ยงลดลงจากมาตรการควบคุมที่ดี",
    created_at: "2024-06-02T09:00:00Z",
    updated_at: "2024-06-02T09:00:00Z"
  },
  {
    id: 8,
    assessment_year: 2024,
    assessment_period: 2,
    likelihood_level: 3,
    impact_level: 4,
    risk_score: 12,
    division_risk_id: 3,
    notes: "ยังคงต้องเฝ้าระวัง มีการปรับปรุงระบบรักษาความปลอดภัย",
    created_at: "2024-06-03T10:00:00Z",
    updated_at: "2024-06-03T10:00:00Z"
  }
];

// ข้อมูลสมมติสำหรับ Likelihood Criteria
export const sampleLikelihoodCriteria: LikelihoodCriteria[] = [
  {
    id: 1,
    level: 1,
    name: "ต่ำมาก",
    description: "เหตุการณ์ที่ไม่น่าจะเกิดขึ้น (โอกาสน้อยกว่า 10%)",
    division_risk_id: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 2,
    level: 2,
    name: "ต่ำ",
    description: "เหตุการณ์ที่มีโอกาสเกิดขึ้นน้อย (โอกาส 10-30%)",
    division_risk_id: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 3,
    level: 3,
    name: "ปานกลาง",
    description: "เหตุการณ์ที่มีโอกาสเกิดขึ้นปานกลาง (โอกาส 30-70%)",
    division_risk_id: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 4,
    level: 4,
    name: "สูง",
    description: "เหตุการณ์ที่มีโอกาสเกิดขึ้นสูง (โอกาสมากกว่า 70%)",
    division_risk_id: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  }
];

// ข้อมูลสมมติสำหรับ Impact Criteria
export const sampleImpactCriteria: ImpactCriteria[] = [
  {
    id: 1,
    level: 1,
    name: "ผลกระทบน้อย",
    description: "ผลกระทบต่อองค์กรน้อยมาก สามารถแก้ไขได้ง่าย",
    division_risk_id: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 2,
    level: 2,
    name: "ผลกระทบปานกลาง",
    description: "ผลกระทบต่อองค์กรในระดับปานกลาง ต้องใช้เวลาแก้ไข",
    division_risk_id: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 3,
    level: 3,
    name: "ผลกระทบสูง",
    description: "ผลกระทบต่อองค์กรในระดับสูง ต้องใช้ทรัพยากรมากในการแก้ไข",
    division_risk_id: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 4,
    level: 4,
    name: "ผลกระทบรุนแรง",
    description: "ผลกระทบต่อองค์กรอย่างรุนแรง อาจส่งผลกระทบต่อการดำเนินงานทั้งหมด",
    division_risk_id: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  }
];
