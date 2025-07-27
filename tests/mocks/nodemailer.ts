import { vi } from 'vitest';

const mockSendMail = vi.fn().mockResolvedValue({ messageId: 'test-message-id' });
const mockTransporter = {
    sendMail: mockSendMail,
};
const createTransport = vi.fn().mockReturnValue(mockTransporter);

export default {
    createTransport,
};

export { createTransport }; 