import { sign, SignOptions, Secret } from 'jsonwebtoken';
import { hashSync } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export interface TestUser {
    id: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    roleId?: string;
    phoneNum?: number;
    country?: string;
    address?: string;
    imageUrl?: string;
    verifiedUser?: boolean;
    vip?: boolean;
    googleId?: string;
    facebookId?: string;
    shipAddress?: Array<{
        id: string;
        title: string;
        address: string;
        default: boolean;
    }>;
}

export const createTestUser = (overrides: Partial<TestUser> = {}): TestUser => {
    const defaultUser: TestUser = {
        id: uuidv4(),
        email: `test-${uuidv4()}@example.com`,
        password: hashSync('password123', 10),
        firstName: 'Test',
        lastName: 'User',
        roleId: uuidv4(),
        phoneNum: 1234567890,
        country: 'Test Country',
        address: 'Test Address',
        imageUrl: 'https://example.com/image.jpg',
        verifiedUser: false,
        vip: false,
        googleId: '',
        facebookId: '',
        shipAddress: [{
            id: uuidv4(),
            title: 'Home',
            address: 'Test Address',
            default: true,
        }],
    };

    return { ...defaultUser, ...overrides };
};

export const generateTestToken = (user: Partial<TestUser> = {}, expiresIn: string | number = '1h'): string => {
    const payload = {
        UserId: user.id || uuidv4(),
        email: user.email || 'test@example.com',
    };

    const secret = (process.env.JWT_SECRET || 'test_secret') as Secret;
    const options: SignOptions = { expiresIn: Number(expiresIn) };
    return sign(payload, secret, options);
};

export const generateTestRefreshToken = (user: Partial<TestUser> = {}, expiresIn: string | number = '7d'): string => {
    const payload = {
        UserId: user.id || uuidv4(),
        email: user.email || 'test@example.com',
    };

    const secret = (process.env.JWT_SECRET_REFRESH || 'test_refresh_secret') as Secret;
    const options: SignOptions = { expiresIn: Number(expiresIn) };
    return sign(payload, secret, options);
};

export const mockOAuthTokens = {
    google: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlOTczZWUyZT...', // Example Google token format
    facebook: 'EAAJKpXS3ZB8wBALZA9ZBqZBqL8ZCZA...', // Example Facebook token format
};

export const mockGoogleProfile = {
    sub: uuidv4(),
    email: 'google@example.com',
    given_name: 'Google',
    family_name: 'User',
    picture: 'https://example.com/google-profile.jpg',
};

export const mockFacebookProfile = {
    id: uuidv4(),
    email: 'facebook@example.com',
    name: 'Facebook User',
    picture: {
        data: {
            url: 'https://example.com/facebook-profile.jpg',
        },
    },
};

export const generateOTP = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

export const mockCloudinaryResponse = {
    secure_url: 'https://example.com/uploaded-image.jpg',
    public_id: 'test/uploaded-image',
};

export const mockMailResponse = {
    messageId: '<test123@example.com>',
    envelope: {
        from: 'test@example.com',
        to: ['recipient@example.com'],
    },
    accepted: ['recipient@example.com'],
    rejected: [],
    pending: [],
    response: '250 Message accepted',
};

export const mockSMSResponse = {
    sid: 'SM123456789',
    status: 'queued',
    to: '+1234567890',
    from: '+0987654321',
}; 