import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, redirectToHome, redirectToLogin, Tokens } from 'next-firebase-auth-edge';
import { filterStandardClaims } from 'next-firebase-auth-edge/lib/auth/claims';
import { clientConfig, serverConfig } from './config';
import { AUTH_USER } from './models/auth-user';

const publicRoutes = ['/auth/sign-in', '/auth/register', '/auth/forgot-password'];

const assignCompanyAndAdmin = async (authUser: AUTH_USER) => {
  if (!authUser.companyId) {
    authUser.companyId = `${authUser.uid}`;
    authUser.isAdmin = true;

    console.debug('assignCompanyAndAdmin > Assigned:', {
      uid: authUser.uid,
      companyId: authUser.companyId,
      isAdmin: authUser.isAdmin,
    });
  }

  return authUser;
};

const toUser = async ({ decodedToken }: Tokens): Promise<AUTH_USER> => {
  const {
    uid,
    email,
    picture: photoURL,
    email_verified: emailVerified,
    phone_number: phoneNumber,
    name: displayName,
    source_sign_in_provider: signInProvider,
  } = decodedToken;

  const claims = filterStandardClaims(decodedToken);

  const authUser = {
    uid,
    user: null,
    email: email ?? null,
    emailVerified: emailVerified ?? false,
    phoneNumber: phoneNumber ?? null,
    displayName: displayName ?? null,
    photoURL: photoURL ?? null,
    providerId: signInProvider,

    customClaims: claims,
    companyId: (claims.companyId as string) || '',
    isActive: (claims['isActive'] as boolean) || false,
    isAdmin: (claims['isAdmin'] as boolean) || false,
    isOwner: (claims['isOwner'] as boolean) || false,
    roles: (claims.roles as string[]) || [],
  } as AUTH_USER;

  return assignCompanyAndAdmin(authUser);
};

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  console.debug('middleware > pathname:', pathname);

  return authMiddleware(req, {
    loginPath: '/api/login',
    logoutPath: '/api/logout',
    refreshTokenPath: '/api/refresh-token',
    apiKey: clientConfig.apiKey,
    cookieName: serverConfig.cookieName,
    cookieSignatureKeys: serverConfig.cookieSignatureKeys,
    cookieSerializeOptions: serverConfig.cookieSerializeOptions,
    serviceAccount: serverConfig.serviceAccount,
    handleValidToken: async (tokens, headers) => {
      let authUser = await toUser(tokens);
      console.debug('handleValidToken > authUser:', {
        uid: authUser.uid,
        email: authUser.email,
        companyId: authUser.companyId,
        providerId: authUser.providerId,
        roles: authUser.roles,
        isAdmin: authUser.isAdmin,
      });

      // Authenticated user should not be able to access 'public routes'
      if (publicRoutes.includes(pathname)) {
        return redirectToHome(req);
      }

      if (authUser.isOwner) {
        console.debug('middleware > isOwner access:', { url: req.url });
        return NextResponse.next({
          request: {
            headers,
          },
        });
      }

      if (!authUser.isAdmin && ['/administration'].includes(pathname)) {
        console.debug('middleware > isAdmin redirect:', { url: req.url });
        return NextResponse.redirect(new URL('/auth/forbidden', req.url));
      }

      return NextResponse.next({
        request: {
          headers,
        },
      });
    },
    handleInvalidToken: async (reason) => {
      console.debug('Missing or malformed credentials', { reason });
      return redirectToLogin(req, {
        publicPaths: publicRoutes,
        path: '/auth/sign-in',
      });
    },
    handleError: async (error) => {
      console.error('Unhandled authentication error', { error });
      return redirectToLogin(req, {
        publicPaths: publicRoutes,
        path: '/auth/sign-in',
        path: '/auth/sign-in',
      });
    },
  });
}

export const config = {
  matcher: ['/', '/((?!_next|api|.*\.).*)', '/api/login', '/api/logout'],
};
