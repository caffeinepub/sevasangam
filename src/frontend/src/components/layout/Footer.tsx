import { useI18n } from '../../hooks/useI18n';

export default function Footer() {
  const { t } = useI18n();
  
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container py-8 px-4">
        <div className="text-center text-sm text-muted-foreground">
          <span>{t('footer.copyright')}</span>
        </div>
      </div>
    </footer>
  );
}
