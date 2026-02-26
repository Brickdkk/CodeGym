import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import bcrypt from "bcryptjs";
import { db } from "./db.js";
import { users } from "../shared/schema.js";
import { eq } from "drizzle-orm";
import { storage } from "./storage.js";

// Local Strategy - Email y Contraseña
export function configureLocalStrategy() {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await db.query.users.findFirst({
            where: eq(users.email, email),
          });

          if (!user || !user.password) {
            return done(null, false, { message: "Credenciales incorrectas" });
          }

          // Comparar contraseña con hash
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return done(null, false, { message: "Credenciales incorrectas" });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

// Google OAuth Strategy
export function configureGoogleStrategy() {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  // URL dinámica para el callback de Google
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  
  const callbackURL = `${baseUrl}/api/auth/google/callback`;

  if (!clientID || !clientSecret) {
    console.warn("No se encontraron credenciales de Google OAuth. Esta estrategia no estará disponible.");
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
        proxy: true,
      },
  async (_accessToken: string, _refreshToken: string, profile: any, done: (err: any, user?: any) => void) => {
        try {
          // Buscar usuario por googleId
          let user = await db.query.users.findFirst({
            where: eq(users.googleId, profile.id),
          });

          // Si no se encuentra, buscar por email
          if (!user && profile.emails && profile.emails.length > 0) {
            const email = profile.emails[0].value;
            user = await db.query.users.findFirst({
              where: eq(users.email, email),
            });

            // Si existe el usuario, actualizar con googleId
            if (user) {
              await db
                .update(users)
                .set({ googleId: profile.id } as any)
                .where(eq(users.id, user.id));
              
              // Refrescar datos de usuario
              user = await db.query.users.findFirst({
                where: eq(users.id, user.id),
              });
            }
          }

          // Si aún no existe el usuario, crear uno nuevo
          if (!user) {
            const newUser = {
              id: `google_${profile.id}`,
              email: profile.emails?.[0]?.value,
              firstName: profile.name?.givenName || profile.displayName?.split(" ")[0] || "",
              lastName: profile.name?.familyName || (profile.displayName?.split(" ").slice(1).join(" ") || ""),
              profileImageUrl: profile.photos?.[0]?.value || "",
              googleId: profile.id,
            };

            await storage.upsertUser(newUser);
            user = await db.query.users.findFirst({
              where: eq(users.googleId, profile.id),
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

// GitHub OAuth Strategy
export function configureGitHubStrategy() {
  const clientID = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  
  // URL dinámica para el callback de GitHub
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  
  const callbackURL = `${baseUrl}/api/auth/github/callback`;

  if (!clientID || !clientSecret) {
    console.warn("No se encontraron credenciales de GitHub OAuth. Esta estrategia no estará disponible.");
    return;
  }

  passport.use(
    new GitHubStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
        scope: ["user:email"],
        proxy: true,
      },
  async (_accessToken: string, _refreshToken: string, profile: any, done: (err: any, user?: any) => void) => {
        try {
          // Buscar usuario por githubId
          let user = await db.query.users.findFirst({
            where: eq(users.githubId, profile.id),
          });

          // Si no se encuentra, buscar por email
          if (!user && profile.emails && profile.emails.length > 0) {
            const email = profile.emails[0].value;
            user = await db.query.users.findFirst({
              where: eq(users.email, email),
            });

            // Si existe el usuario, actualizar con githubId
            if (user) {
              await db
                .update(users)
                .set({ githubId: profile.id } as any)
                .where(eq(users.id, user.id));
              
              // Refrescar datos de usuario
              user = await db.query.users.findFirst({
                where: eq(users.id, user.id),
              });
            }
          }

          // Si aún no existe el usuario, crear uno nuevo
          if (!user) {
            const newUser = {
              id: `github_${profile.id}`,
              email: profile.emails?.[0]?.value,
              firstName: profile.displayName?.split(" ")[0] || "",
              lastName: profile.displayName?.split(" ").slice(1).join(" ") || "",
              profileImageUrl: profile.photos?.[0]?.value || "",
              githubId: profile.id.toString(),
            };

            await storage.upsertUser(newUser);
            user = await db.query.users.findFirst({
              where: eq(users.githubId, profile.id),
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

// Función para configurar todas las estrategias
export function configureAllAuthStrategies() {
  // Configurar estrategias de autenticación
  configureLocalStrategy();
  configureGoogleStrategy();
  configureGitHubStrategy();
}

let passportInitialized = false;

export function initializePassport() {
  if (passportInitialized) {
    return;
  }

  configureAllAuthStrategies();

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      done(error as Error);
    }
  });

  passportInitialized = true;
}
