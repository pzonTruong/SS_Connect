import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-[#E9F0F8] dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors duration-200 mt-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Left Column: Branding and Tagline */}
          <div className="md:col-span-6 space-y-4">
            <h3 className="text-xl font-bold text-brand-navy dark:text-white tracking-tight">
              Student Success
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
              Đồng hành cùng bạn trên con đường xây dựng sự nghiệp vững chắc.
            </p>
          </div>

          {/* Middle Column: Quick Links */}
          <div className="md:col-span-6 flex flex-col md:items-start space-y-3">
            <h4 className="text-sm font-bold text-brand-navy dark:text-white uppercase tracking-wider">
              Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/resources"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand-blue dark:hover:text-sky-400 transition-colors duration-200"
                >
                  Resources
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand-blue dark:hover:text-sky-400 transition-colors duration-200"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand-blue dark:hover:text-sky-400 transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand-blue dark:hover:text-sky-400 transition-colors duration-200"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand-blue dark:hover:text-sky-400 transition-colors duration-200"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            © 2024 Student Success Department. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
