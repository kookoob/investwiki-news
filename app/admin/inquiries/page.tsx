'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/app/components/Header';
import InquiryList from './InquiryList';
import { isAdmin } from '@/lib/security';

export default function AdminInquiriesPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  async function checkAuthAndLoadData() {
    try {
      // 사용자 확인
      const { data: { user } } = await supabase.auth.getUser();
      
      // 관리자 체크
      if (!user || !isAdmin(user.email)) {
        router.push('/');
        return;
      }

      setIsAuthorized(true);

      // 문의사항 로드
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('문의사항 조회 오류:', error);
        setInquiries([]);
      } else {
        setInquiries(data || []);
      }
    } catch (error) {
      console.error('인증 오류:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // 리다이렉트 중
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            📨 문의사항 관리
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            총 {inquiries.length}개 문의
          </p>
        </div>

        <InquiryList inquiries={inquiries} />
      </div>
    </div>
  );
}
