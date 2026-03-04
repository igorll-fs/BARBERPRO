import { renderHook, act } from '@testing-library/react-native';
import { useUser } from '../../store/user';

describe('useUser Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useUser());
    act(() => {
      result.current.logout();
    });
  });

  it('should have initial state', () => {
    const { result } = renderHook(() => useUser());
    
    expect(result.current.uid).toBeNull();
    expect(result.current.name).toBe('');
    expect(result.current.role).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should set user data', () => {
    const { result } = renderHook(() => useUser());
    
    act(() => {
      result.current.setUser({
        uid: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'cliente',
        shopId: 'shop-123',
      });
    });
    
    expect(result.current.uid).toBe('123');
    expect(result.current.name).toBe('Test User');
    expect(result.current.role).toBe('cliente');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should clear user data on logout', () => {
    const { result } = renderHook(() => useUser());
    
    act(() => {
      result.current.setUser({
        uid: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'cliente',
      });
    });
    
    act(() => {
      result.current.logout();
    });
    
    expect(result.current.uid).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
