import type { SavedUserWorkflow } from "../workflowTypes";

// 백엔드 엔티티 구조와 일치하는 타입 정의
export type LibraryDevice = {
  id: string;
  name: string;
  deviceType: "SENSOR" | "ACTUATOR";
  subtype?: string;
};

// ─── 인증 관련 타입 ───

export type AuthResponse = {
  token: string;
  uid: string;
  name: string;
  role: string;
};

export type UserResponse = {
  uid: string;
  name: string;
  email: string;
  role: string;
};

// ─── 템플릿 관련 타입 ───

export type TemplateItem = {
  id: string;
  name: string;
  description: string;
  cropType: string;
  flowData: string;
  ruleData: string;
  scheduleData: string;
  author: string;
  downloadCnt: number;
};

const BASE_URL = "http://localhost:8080/api/v1";

// ─── JWT 토큰 관리 ───

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function setToken(token: string): void {
  localStorage.setItem("token", token);
}

export function clearToken(): void {
  localStorage.removeItem("token");
}

/** 인증 헤더가 포함된 fetch wrapper — 모든 보호 API에서 사용 */
async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
}

// ─── 인증(Auth) API ───

/** FR-AUTH-001: 회원가입 — JWT 즉시 발급 */
export async function signupApi(
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "회원가입 실패" }));
    throw new Error(err.error || "회원가입 실패");
  }
  return res.json();
}

/** FR-AUTH-002: 로그인 — JWT 발급 + Redis session 저장 */
export async function loginApi(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "로그인 실패" }));
    throw new Error(
      err.error || "아이디 또는 비밀번호가 일치하지 않습니다."
    );
  }
  return res.json();
}

/** FR-AUTH-003: 로그아웃 — Redis session 삭제 + 로컬 토큰 제거 */
export async function logoutApi(): Promise<void> {
  try {
    await authFetch(`${BASE_URL}/auth/logout`, { method: "POST" });
  } catch {
    // 네트워크 오류여도 로컬 토큰은 반드시 삭제
  }
  clearToken();
}

/** FR-AUTH-004: 내 정보 조회 — 토큰 유효성 검증 겸용 */
export async function getMeApi(): Promise<UserResponse> {
  const res = await authFetch(`${BASE_URL}/auth/me`);
  if (!res.ok) {
    throw new Error("인증이 만료되었습니다.");
  }
  return res.json();
}

// ─── 장치(Device) API ───

/** 백엔드 DB에서 장치 목록을 가져오는 함수 */
export async function fetchDevicesApi(): Promise<LibraryDevice[]> {
  const response = await authFetch(`${BASE_URL}/devices`);
  if (!response.ok) throw new Error("장치 데이터를 불러올 수 없습니다.");

  const data = await response.json();
  console.log("Fetched Devices from DB:", data);

  return data.map((d: any) => ({
    id: d.uid || d.id?.toString(),
    name: d.name,
    deviceType: d.deviceType || d.device_type,
    subtype: d.sensorType || d.actuatorType || d.sensor_type,
  }));
}

/** 장치 등록 */
export async function registerDeviceApi(
  deviceData: Record<string, unknown>
): Promise<any> {
  const res = await authFetch(`${BASE_URL}/greenhouses/GH-001/devices`, {
    method: "POST",
    body: JSON.stringify(deviceData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "장치 등록 실패" }));
    throw new Error(err.error || "장치 등록 실패");
  }
  return res.json();
}

/** 장치 삭제 (여러 개 동시) */
export async function deleteDevicesApi(ids: string[]): Promise<void> {
  await Promise.all(
    ids.map((id) =>
      authFetch(`${BASE_URL}/devices/${id}`, { method: "DELETE" })
    )
  );
}

/** 장치 상태 변경 */
export async function updateDeviceStatusApi(
  deviceUid: string,
  status: string
): Promise<any> {
  const res = await authFetch(`${BASE_URL}/devices/${deviceUid}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("상태 변경 실패");
  return res.json();
}

// ─── 워크플로우(Workflow) API ───

/** 백엔드에서 워크플로우 목록을 가져오는 함수 */
export async function fetchWorkflowsApi(): Promise<SavedUserWorkflow[]> {
  const res = await authFetch(`${BASE_URL}/workflows`);
  if (!res.ok) throw new Error("워크플로우 로드 실패");

  const data = await res.json();
  return data.map((w: any) => ({
    id: w.uid || w.id?.toString(),
    name: w.name,
    nodes: w.flowData ? JSON.parse(w.flowData).nodes || [] : [],
    edges: w.flowData ? JSON.parse(w.flowData).edges || [] : [],
  }));
}

/** 워크플로우 저장 (새로 만들기) */
export async function saveWorkflowApi(
  name: string,
  flowData: string
): Promise<void> {
  const res = await authFetch(`${BASE_URL}/workflows`, {
    method: "POST",
    body: JSON.stringify({ name, flowData }),
  });
  if (!res.ok) throw new Error("저장 실패");
}

/** 워크플로우 수정 (기존 것 업데이트) */
export async function updateWorkflowApi(
  id: string,
  name: string,
  flowData: string
): Promise<void> {
  const res = await authFetch(`${BASE_URL}/workflows/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name, flowData }),
  });
  if (!res.ok) throw new Error("수정 실패");
}

/** 워크플로우 삭제 */
export async function deleteWorkflowApi(id: string): Promise<void> {
  const res = await authFetch(`${BASE_URL}/workflows/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("삭제 실패");
}

/** 워크플로우 배포 */
export async function deployWorkflowApi(id: string): Promise<void> {
  const res = await authFetch(`${BASE_URL}/workflows/${id}/deploy`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("배포 실패");
}

// ─── 템플릿(Template) API ───

/** 템플릿 목록 조회 (작물별 필터 지원) — FR-TPL-001 */
export async function fetchTemplatesApi(
  cropType?: string
): Promise<TemplateItem[]> {
  const url = cropType
    ? `${BASE_URL}/templates?crop_type=${cropType}`
    : `${BASE_URL}/templates`;
  const res = await authFetch(url);
  if (!res.ok) throw new Error("템플릿 로드 실패");
  const data = await res.json();
  return data.map((t: any) => ({
    id: t.uid || t.id?.toString(),
    name: t.name || "",
    description: t.description || "",
    cropType: t.cropType || t.crop_type || "",
    flowData: t.flowData || t.flow_data || "{}",
    ruleData: t.ruleData || t.rule_data || "{}",
    scheduleData: t.scheduleData || t.schedule_data || "{}",
    author: t.author || "",
    downloadCnt: t.downloadCnt ?? t.download_cnt ?? 0,
  }));
}

/** 템플릿 적용 — FR-TPL-002: 워크플로우 + 스케줄 세트 복사 생성 */
export async function applyTemplateApi(templateId: string): Promise<void> {
  const res = await authFetch(`${BASE_URL}/templates/${templateId}/apply`, {
    method: "POST",
    body: JSON.stringify({ greenhouseUid: "GH-001" }),
  });
  if (!res.ok) throw new Error("템플릿 적용 실패");
}