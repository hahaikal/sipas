export const getSubdomain = (): string => {
  if (process.env.NODE_ENV === 'production') {
    // lingkungan produksi
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      const parts = host.split('.');
      if (parts.length > 2 && parts[0] !== 'www') {
        return parts[0];
      }
    }
    return '';
  } else {
    // lingkungan development
    return process.env.NEXT_PUBLIC_DEV_SUBDOMAIN || 'smaharapanbangsa';
  }
};