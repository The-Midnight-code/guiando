import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  contentSecurityPolicy: {
    directives: {
      "connect-src": ["https://nominatim.openstreetmap.org"],
      "img-src": [
        "https://*.tile.openstreetmap.org",
        "https://fastly.picsum.photos",
      ],
    },
  },
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
