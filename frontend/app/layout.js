import './globals.css';
import { SCHOOL_INFO } from '@/lib/data';
import { Providers } from '@/src/components/Providers';
import { PwaRedirectGuard } from '@/src/components/PwaRedirectGuard';
import { ConditionalLayout } from '@/src/components/ConditionalLayout';

export const metadata = {
  title: `${SCHOOL_INFO.name} - ${SCHOOL_INFO.tagline}`,
  manifest: "/manifest.json",
  description: `Welcome to ${SCHOOL_INFO.name}. A premier educational institution committed to excellence in education and holistic student development.`,
  keywords: 'school, education, CBSE, academics, admissions, greenwood',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">
        <Providers>
          <PwaRedirectGuard>
            <ConditionalLayout>{children}</ConditionalLayout>
          </PwaRedirectGuard>
        </Providers>
      </body>
    </html>
  );
}