import { useUser } from '../src/store/user';

describe('User Store (Zustand)', () => {
  beforeEach(() => {
    useUser.setState({ role: null, shopId: undefined });
  });

  it('estado inicial é role null', () => {
    const state = useUser.getState();
    expect(state.role).toBeNull();
    expect(state.shopId).toBeUndefined();
  });

  it('setRole atualiza role corretamente', () => {
    useUser.getState().setRole('dono');
    expect(useUser.getState().role).toBe('dono');
  });

  it('setRole aceita todos os roles válidos', () => {
    const roles = ['cliente', 'dono', 'funcionario', null] as const;
    roles.forEach(role => {
      useUser.getState().setRole(role);
      expect(useUser.getState().role).toBe(role);
    });
  });

  it('setShop atualiza shopId', () => {
    useUser.getState().setShop('shop123');
    expect(useUser.getState().shopId).toBe('shop123');
  });

  it('setShop aceita undefined para limpar', () => {
    useUser.getState().setShop('shop123');
    useUser.getState().setShop(undefined);
    expect(useUser.getState().shopId).toBeUndefined();
  });
});
