import BuyableCardList from '@/src/components/BuyableCards/BuyableCardList/BuyableCardList';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { useBuyableItemsStore } from '@/src/store/buyableItems';
import { useShoppingCartStore } from '@/src/store/shoppingcart';
import { render, screen, waitFor } from '@testing-library/react';
import { useSession } from '@/src/lib/context/AuthProvider';
import React from 'react';

// Mock the next-intl useTranslations hook
jest.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

// The hooks below are replaced wholesale. They have to be mocked at the module
// level rather than with jest.spyOn: next/jest compiles these modules with SWC,
// whose exports are non-configurable getters, so spyOn throws
// "Cannot redefine property".
jest.mock('@/src/store/buyableItems', () => ({
    useBuyableItemsStore: jest.fn(),
}));

jest.mock('@/src/store/shoppingcart', () => ({
    useShoppingCartStore: jest.fn(),
}));

jest.mock('@/src/lib/context/NotificationProvider', () => ({
    useNotifications: jest.fn(),
}));

jest.mock('@/src/lib/context/AuthProvider', () => ({
    useSession: jest.fn(),
}));

// Mock the next/image component
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        // eslint-disable-next-line @next/next/no-img-element
        return <img {...props} alt={props.alt || ''} />;
    },
}));

// Mock Link component from next/link
jest.mock('next/link', () => {
    return ({ href, children }: { href: string; children: React.ReactNode }) => {
        return <a href={href}>{children}</a>;
    };
});

// Setup for Jest DOM extensions
import { Notification } from '@/src/lib/context/NotificationProvider/types';
import '@testing-library/jest-dom';

describe('BuyableCardList', () => {
    // Mock implementations
    const mockRefresh = jest.fn();
    const mockFilterItems = jest.fn();
    const mockSetFilter = jest.fn();
    const mockResetFilters = jest.fn();
    const mockRemoveItem = jest.fn();

    // Create mock data
    const mockItems = [
        {
            id: 1,
            buylistId: 101,
            uuid: 'card-123',
            name: 'Test Card',
            quantity: 2,
            maxBuys: 5,
            bought: 0,
            price: 10.99,
            quality: 'NM',
            language: 'EN',
            isFoil: 0,
            isAltered: 0,
            isSigned: 0,
            isMisprint: 0,
            isGraded: 0,
            comment: 'Test comment',
            createdAt: '2023-01-01',
            updatedAt: '2023-01-02',
            user: 'testuser',
            country: 'DE',
            userId: 1001,
        },
        {
            id: 2,
            buylistId: 101,
            uuid: 'card-456',
            name: 'Another Card',
            quantity: 1,
            maxBuys: 3,
            bought: 0,
            price: 5.99,
            quality: 'EX',
            language: 'FR',
            isFoil: 1,
            isAltered: 0,
            isSigned: 1,
            isMisprint: 0,
            isGraded: 0,
            createdAt: '2023-01-03',
            updatedAt: '2023-01-04',
            user: 'anotheruser',
            country: 'FR',
            userId: 1002,
        },
    ];

    // Setup test environment
    beforeEach(() => {
        jest.resetAllMocks();

        // Mock the useBuyableItemsStore hook
        (useBuyableItemsStore as unknown as jest.Mock).mockReturnValue({
            loading: false,
            refresh: mockRefresh,
            items: mockItems,
            filteredItems: mockItems,
            filters: {
                country: '',
                quality: '',
                language: [],
                price: '',
                isFoil: '',
                isAltered: '',
                isSigned: '',
                isMisprint: '',
                isGraded: '',
            },
            hasFilters: false,
            setFilter: mockSetFilter,
            filterItems: mockFilterItems,
            resetFilters: mockResetFilters,
            removeItem: mockRemoveItem,
        });

        // Mock the useSession hook
        (useSession as jest.Mock).mockReturnValue({
            data: {
                user: {
                    name: 'testuser',
                    email: 'test@example.com',
                },
                userId: 123,
                expires: '2025-01-01',
                roles: ['user'],
                userName: 'testuser',
                settings: [],
            },
            status: 'authenticated',
            update: jest.fn(),
        });

        // Mock the useNotifications hook
        (useNotifications as jest.Mock).mockReturnValue({
            notifications: [],
            addSuccessNotification: jest.fn(),
            addErrorNotification: jest.fn(),
            removeNotification: jest.fn(),
            addNotification: function (notification: Notification): void {
                throw new Error('Function not implemented.');
            },
            addWarningNotification: function (message: string): void {
                throw new Error('Function not implemented.');
            },
            resetNotifications: function (): void {
                throw new Error('Function not implemented.');
            },
        });

        // Mock the useShoppingCartStore hook
        (useShoppingCartStore as unknown as jest.Mock).mockReturnValue({
            loading: false,
            adding: false,
            removing: false,
            items: [],
            funds: 0,
            addShoppingCartItem: jest.fn().mockResolvedValue({ success: true }),
            removeShoppingCartItem: jest.fn().mockResolvedValue({ success: true }),
            getShoppingCartPrice: jest.fn().mockReturnValue(0),
            refreshShoppingCartItems: jest.fn(),
            refreshFunds: jest.fn(),
        });
    });

    test('calls refresh on mount', () => {
        // Render the component
        render(<BuyableCardList uuid='test-uuid' name='Test Card' />);

        // Verify refresh was called with the uuid
        expect(mockRefresh).toHaveBeenCalledWith('test-uuid');
    });

    test('displays loading state when loading', () => {
        // Mock the loading state
        (useBuyableItemsStore as unknown as jest.Mock).mockReturnValueOnce({
            ...(useBuyableItemsStore as unknown as jest.Mock)(),
            loading: true,
        });

        // Render component
        render(<BuyableCardList uuid='test-uuid' name='Test Card' />);

        // Check for loading indicators
        const progressElements = screen.getAllByRole('progressbar');
        expect(progressElements.length).toBeGreaterThan(0);
    });

    test('does not nest table rows invalidly while loading over existing items', () => {
        // The populated table renders as div/span, so the loading row has to follow suit.
        // A real <tr> inside that <div> is invalid HTML that the browser hoists out of the
        // container, which React reports as a hydration error. Asserted against the DOM
        // rather than React's warning, because React logs each nesting violation only once
        // per process and an earlier test in this file renders the same state.
        (useBuyableItemsStore as unknown as jest.Mock).mockReturnValueOnce({
            ...(useBuyableItemsStore as unknown as jest.Mock)(),
            loading: true,
        });

        const { container } = render(<BuyableCardList uuid='test-uuid' name='Test Card' />);

        expect(container.querySelectorAll('div > tr')).toHaveLength(0);
        expect(container.querySelectorAll('div > td')).toHaveLength(0);
    });

    test('displays no results message when there are no items', async () => {
        // Mock empty data state
        (useBuyableItemsStore as unknown as jest.Mock).mockReturnValueOnce({
            ...(useBuyableItemsStore as unknown as jest.Mock)(),
            items: [],
            filteredItems: [],
            loading: false,
        });

        // Render component
        render(<BuyableCardList uuid='test-uuid' name='Test Card' />);

        // Check for no results message
        const noResultsMessage = await screen.findByText('appBar.searchField.noResults');
        expect(noResultsMessage).toBeInTheDocument();
    });

    test('displays buyable cards when there are items', async () => {
        // Render component with mock data
        render(<BuyableCardList uuid='test-uuid' name='Test Card' />);

        // Check that items are displayed
        await waitFor(() => {
            // Check for the first item's quality
            expect(screen.getByText('NM')).toBeInTheDocument();

            // Check for the second item's quality
            expect(screen.getByText('EX')).toBeInTheDocument();

            // Check for user links
            const userLinks = screen.getAllByText(/user/);
            expect(userLinks.length).toBeGreaterThan(0);
        });
    });

    test('displays separate sections for own items and other users items', async () => {
        // Render component with mixed data (own items and others)
        render(<BuyableCardList uuid='test-uuid' name='Test Card' />);

        // Check for the section divider between own items and others
        // This is a bit tricky to test directly since the divider is just styling
        // So we'll check for both user types being present
        await waitFor(() => {
            const testUserItems = screen.getAllByText('testuser');
            const anotherUserItems = screen.getAllByText('anotheruser');

            expect(testUserItems.length).toBeGreaterThan(0);
            expect(anotherUserItems.length).toBeGreaterThan(0);
        });
    });
});
