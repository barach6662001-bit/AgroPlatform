import { ReactNode } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

interface Props {
  refreshing: boolean;
  onRefresh: () => void;
  children: ReactNode;
}

export function PullToRefresh({ refreshing, onRefresh, children }: Props) {
  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {children}
    </ScrollView>
  );
}
