'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { PublicVerification } from '@/components/PublicVerification';
import { INITIAL_CERTIFICATES } from '@/lib/mockData';

export default function ValidarHashPage() {
  const params = useParams();
  const hash = params?.hash as string || '';

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 p-6 md:p-12">
      <PublicVerification certificates={INITIAL_CERTIFICATES} initialHash={hash} />
    </div>
  );
}
