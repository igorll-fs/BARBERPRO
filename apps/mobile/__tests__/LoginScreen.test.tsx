import React from 'react';
import { render } from '@testing-library/react-native';
import LoginScreen from '../src/screens/auth/LoginScreen';

it('renderiza título BarberPro', () => {
  const { getByText } = render(<LoginScreen navigation={{ replace: jest.fn() } as any} route={{} as any} />);
  expect(getByText('BarberPro')).toBeTruthy();
});
