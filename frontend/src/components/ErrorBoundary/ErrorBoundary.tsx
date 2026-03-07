import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Result, Button } from 'antd';
import uk from '../../i18n/uk';
import en from '../../i18n/en';
import { useLangStore } from '../../stores/langStore';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      const lang = useLangStore.getState().lang;
      const t = lang === 'en' ? en : uk;
      return (
        <Result
          status="error"
          title={t.errors.serverError}
          subTitle={t.errors.serverErrorDesc}
          extra={[
            <Button type="primary" key="reload" onClick={() => window.location.reload()}>
              {t.errors.reload}
            </Button>,
            <Button key="home" onClick={() => { window.location.href = '/'; }}>
              {t.errors.backHome}
            </Button>,
          ]}
        />
      );
    }
    return this.props.children;
  }
}
