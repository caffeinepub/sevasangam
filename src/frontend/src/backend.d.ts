import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Location {
    latitude?: number;
    country?: string;
    city?: string;
    district?: string;
    longitude?: number;
    address?: string;
}
export interface Category {
    id: string;
    status: Status__1;
    name: string;
    description?: string;
}
export interface Pricing {
    rate_per_day?: bigint;
    special_offers: Array<string>;
    rate_per_hour?: bigint;
    currency?: string;
}
export interface Schedule {
    timezone?: string;
    close_time?: string;
    available_days: Array<string>;
    open_time?: string;
}
export interface Integrations {
    website_url?: string;
    instagram_handle?: string;
    whatsapp_number?: string;
    facebook_username?: string;
}
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface WorkerProfile {
    id: string;
    status: Status;
    principal: Principal;
    integrations: Integrations;
    published: boolean;
    pricing: Pricing;
    availability: Schedule;
    years_experience: bigint;
    photo?: ExternalBlob;
    phone_number: string;
    location: Location;
    full_name: string;
    category_id: string;
}
export interface Inquiry {
    id: string;
    status: InquiryStatus;
    response_text?: string;
    created_at: bigint;
    worker_id: string;
    customer_contact?: string;
    response_given: boolean;
    customer_name?: string;
    inquiry_text: string;
    inquiry_type: InquiryType;
}
export interface UserProfile {
    name: string;
    role: string;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum InquiryStatus {
    new_ = "new",
    pending = "pending",
    completed = "completed"
}
export enum InquiryType {
    question = "question",
    feedback = "feedback",
    booking = "booking"
}
export enum Status {
    featured = "featured",
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum Status__1 {
    active = "active",
    pending_approval = "pending_approval",
    rejected = "rejected",
    suspended = "suspended"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    approveWorker(username: string | null, password: string | null, workerId: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCategory(username: string | null, password: string | null, category: Category): Promise<void>;
    createInquiry(inquiry: Inquiry): Promise<void>;
    deleteCategory(username: string | null, password: string | null, categoryId: string): Promise<void>;
    deleteInquiry(username: string | null, password: string | null, inquiryId: string): Promise<void>;
    getAllCategories(): Promise<Array<Category>>;
    getAllInquiries(username: string | null, password: string | null): Promise<Array<Inquiry>>;
    getAllWorkers(): Promise<Array<WorkerProfile>>;
    getAllWorkersAdmin(username: string | null, password: string | null): Promise<Array<WorkerProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategory(categoryId: string): Promise<Category | null>;
    getMyWorkerProfile(): Promise<WorkerProfile | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWorkerInquiries(workerId: string): Promise<Array<Inquiry>>;
    getWorkerInquiriesAdmin(username: string | null, password: string | null, workerId: string): Promise<Array<Inquiry>>;
    getWorkerProfile(workerId: string): Promise<WorkerProfile | null>;
    getWorkerProfileAdmin(username: string | null, password: string | null, workerId: string): Promise<WorkerProfile | null>;
    getWorkersByCategory(categoryId: string): Promise<Array<WorkerProfile>>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    publishWorker(username: string | null, password: string | null, workerId: string): Promise<void>;
    registerWorker(profile: WorkerProfile): Promise<void>;
    rejectWorker(username: string | null, password: string | null, workerId: string): Promise<void>;
    removeWorker(username: string | null, password: string | null, workerId: string): Promise<void>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    unpublishWorker(username: string | null, password: string | null, workerId: string): Promise<void>;
    updateCategory(username: string | null, password: string | null, categoryId: string, category: Category): Promise<void>;
    updateInquiry(username: string | null, password: string | null, inquiryId: string, inquiry: Inquiry): Promise<void>;
    updateWorkerProfile(workerId: string, profile: WorkerProfile): Promise<void>;
}
