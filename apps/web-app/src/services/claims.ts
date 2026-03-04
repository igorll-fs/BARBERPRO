import { getIdTokenResult } from 'firebase/auth';
import { auth } from './firebase';

export async function getClaims() {
    const user = auth.currentUser;
    if (!user) return {} as any;
    const token = await getIdTokenResult(user, true);
    return token.claims as any;
}
