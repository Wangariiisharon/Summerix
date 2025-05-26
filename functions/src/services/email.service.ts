import { auth } from 'firebase-admin';
import { isProdEnv } from './utils.service';
import { UserRecord } from 'firebase-admin/auth';

export const getWebAppBaseUrl = () => {
  return isProdEnv() ? 'https://summerix.com' : 'https://dev.summerix.com';
};

export const getExistingAccountEmailBody = (user: UserRecord) => {
  const body = `
    <p>Hi ${user.displayName},</p> 
    <p>You have been added as an admin on Launchkit.</p>
    <p>Your login details are:</p>
    <p><b>Email address:</b> ${user.email}</p>
    <p>Use your existing password to login.</p>
    <p>Click <a href="${getWebAppBaseUrl()}/auth/sign-in">here to login.</p>
    <p>Regards,<br/> Launchkit Team</p>`;
  return body;
};

export const getNewAccountEmailBody = async (user: UserRecord, email: string) => {
  const resetPasswordLink = await auth().generatePasswordResetLink(email, {
    url: `${getWebAppBaseUrl()}/auth/forgot-password`,
  });

  const body = `
    <p>Hi ${user.displayName},</p> 
    <p>You have been added as an admin on LaunchKit.</p>
    <p>Click on the link below to set your password.</p>
    <p><b>Email address:</b> ${user.email} </p>
    <p>Click <a href="${resetPasswordLink}">here to set password</p>
    <p>Regards,<br/>LaunchKit Team</p>`;
  return body;
};
