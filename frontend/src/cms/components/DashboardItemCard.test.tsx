import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import DashboardItemCard from './DashboardItemCard';

describe('DashboardItemCard', () => {
  it('renders actions and triggers callbacks', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onTelegram = vi.fn();
    const onShareImages = vi.fn();
    const onSubstack = vi.fn();

    render(
      <DashboardItemCard
        item={{
          id: 1,
          type: 'posts',
          title: 'Friday post',
          date: '2026-09-04T10:00:00.000Z',
          isPublished: true,
          views: 42,
        }}
        onEdit={onEdit}
        onDelete={onDelete}
        onTelegram={onTelegram}
        onShareImages={onShareImages}
        onSubstack={onSubstack}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.click(screen.getByRole('button', { name: 'Telegram' }));
    await user.click(screen.getByRole('button', { name: 'Images' }));
    await user.click(screen.getByRole('button', { name: 'Substack' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onTelegram).toHaveBeenCalledTimes(1);
    expect(onShareImages).toHaveBeenCalledTimes(1);
    expect(onSubstack).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
