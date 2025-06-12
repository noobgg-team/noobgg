"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

export default function LanguageSwitcher({
  isScrolled,
}: {
  isScrolled: boolean;
}) {
  const locale = useLocale();
  const router = useRouter();
  const [flagKey, setFlagKey] = useState(locale);

  const switchLanguage = () => {
    const newLocale = flagKey === "tr" ? "en" : "tr";
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    setFlagKey(newLocale);
    router.refresh();
  };

  const currentLang = flagKey === "tr" ? "TR" : "EN";
  const flagSrc = flagKey === "tr" ? "/flags/tr.svg" : "/flags/en.svg";  
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={switchLanguage}
      title={`Şu an: ${currentLang} - Tıklayınca değişir`}
      className={cn("bg-transparent hover:bg-accent/10 border-accent/20 text-white"
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={flagKey}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25 }}
          className="h-4 w-4"
        >
          <Image
            src={flagSrc}
            alt={currentLang}
            width={16}
            height={16}
            className="h-4 w-4"
          />
        </motion.div>
      </AnimatePresence>
    </Button>
  );
}
