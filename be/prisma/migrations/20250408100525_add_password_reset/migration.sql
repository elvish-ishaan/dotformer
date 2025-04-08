-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PasswordReset_email_idx" ON "PasswordReset"("email");

-- CreateIndex
CREATE INDEX "PasswordReset_otp_idx" ON "PasswordReset"("otp");
