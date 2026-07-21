const apiUrl = import.meta.env.VITE_API_URL || '/';

const authHeader = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export type AdminPaymentStatus = 'Unpaid' | 'Pending' | 'Paid' | 'Failed' | 'Refunded';
export type AdminPaymentMethod = 'COD' | 'BankTransfer' | 'EWallet' | 'OnlineGateway';

export interface AdminPayment {
    id: string;
    orderId: string;
    orderCode: string;
    customerName: string;
    paymentMethod: AdminPaymentMethod;
    paymentStatus: AdminPaymentStatus;
    orderTotalAmount: number;
    amount: number;
    transactionCode?: string | null;
    paidAt?: string | null;
    createdAt: string;
}

export interface AdminPaymentPage {
    items: AdminPayment[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface AdminPaymentSummary {
    paidCount: number;
    unpaidCount: number;
    paidAmount: number;
}

export interface AdminPaymentExportFile {
    blob: Blob;
    fileName: string;
}

export interface AdminPaymentQuery {
    page?: number;
    pageSize?: number;
    keyword?: string;
    status?: AdminPaymentStatus;
    method?: AdminPaymentMethod;
    from?: string;
    to?: string;
}

export class PaymentApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'PaymentApiError';
        this.status = status;
    }
}

const handleResponse = async <T>(response: Response): Promise<T> => {
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
        const fallback = response.status === 403
            ? 'Bạn không có quyền xem dữ liệu thanh toán.'
            : response.status === 401
                ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
                : 'Không thể tải dữ liệu thanh toán. Vui lòng thử lại.';

        throw new PaymentApiError(payload?.message || fallback, response.status);
    }

    return (payload?.data ?? payload) as T;
};

const toQueryString = (params: AdminPaymentQuery, includePagination = true) => {
    const query = new URLSearchParams();
    if (includePagination) {
        query.set('page', String(params.page || 1));
        query.set('pageSize', String(params.pageSize || 20));
    }
    if (params.keyword?.trim()) query.set('keyword', params.keyword.trim());
    if (params.status) query.set('status', params.status);
    if (params.method) query.set('method', params.method);
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    return query.toString();
};

export const getAdminPayments = async (
    params: AdminPaymentQuery,
    signal?: AbortSignal
) => {
    const response = await fetch(`${apiUrl}api/admin/payments?${toQueryString(params)}`, {
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        signal
    });
    return handleResponse<AdminPaymentPage>(response);
};

export const getAdminPaymentById = async (id: string, signal?: AbortSignal) => {
    const response = await fetch(`${apiUrl}api/admin/payments/${id}`, {
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        signal
    });
    return handleResponse<AdminPayment>(response);
};

export const getAdminPaymentSummary = async (
    params: AdminPaymentQuery,
    signal?: AbortSignal
) => {
    const response = await fetch(`${apiUrl}api/admin/payments/summary?${toQueryString(params, false)}`, {
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        signal
    });
    return handleResponse<AdminPaymentSummary>(response);
};

const getExportFileName = (contentDisposition: string | null) => {
    const encodedName = contentDisposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
    if (encodedName) {
        try {
            return decodeURIComponent(encodedName);
        } catch {
            // Fall through to the regular filename or the safe default.
        }
    }

    return contentDisposition?.match(/filename="?([^";]+)"?/i)?.[1]
        || `payment-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
};

export const exportAdminPayments = async (
    params: AdminPaymentQuery
): Promise<AdminPaymentExportFile> => {
    const response = await fetch(`${apiUrl}api/admin/payments/export?${toQueryString(params, false)}`, {
        headers: { ...authHeader() }
    });

    if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const total = payload?.data?.total;
        const limit = payload?.data?.limit;
        const limitMessage = response.status === 400 && Number.isFinite(total) && Number.isFinite(limit)
            ? `Bộ lọc hiện có ${Number(total).toLocaleString('vi-VN')} giao dịch, vượt giới hạn ${Number(limit).toLocaleString('vi-VN')} dòng. Hãy thu hẹp bộ lọc rồi xuất lại.`
            : null;
        const fallback = response.status === 403
            ? 'Bạn không có quyền xuất dữ liệu thanh toán.'
            : response.status === 401
                ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
                : 'Không thể xuất CSV. Vui lòng kiểm tra bộ lọc và thử lại.';

        throw new PaymentApiError(limitMessage || payload?.message || fallback, response.status);
    }

    return {
        blob: await response.blob(),
        fileName: getExportFileName(response.headers.get('Content-Disposition'))
    };
};
