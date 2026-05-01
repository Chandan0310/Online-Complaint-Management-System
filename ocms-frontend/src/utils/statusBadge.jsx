/**
 * @file statusBadge.jsx
 * @description Shared UI helper that renders a styled status badge for a
 *              complaint status string. Imported by every component that
 *              displays complaint status (AdminComplaintsView, ComplaintDetail,
 *              ComplaintHistory, ManagerComplaintDetail, ManagerDashboard).
 */

import React from 'react';

/**
 * Status-to-style mapping used by {@link getStatusBadge}.
 * Each key corresponds to a {@code ComplaintStatus} enum value from the backend.
 * @type {Object.<string, {cls: string, icon: string, label: string}>}
 */
const STATUS_MAP = {
  PENDING:     { cls: 'badge-status badge-pending',  icon: 'bi-hourglass-split',  label: 'Pending' },
  ACCEPTED:    { cls: 'badge-status badge-accepted', icon: 'bi-check-circle',     label: 'Accepted' },
  IN_PROGRESS: { cls: 'badge-status badge-progress', icon: 'bi-gear',             label: 'In Progress' },
  RESOLVED:    { cls: 'badge-status badge-resolved', icon: 'bi-check-circle-fill', label: 'Resolved' },
  REJECTED:    { cls: 'badge-status badge-rejected', icon: 'bi-x-circle',         label: 'Rejected' },
};

/**
 * Returns a styled JSX badge element for the given complaint status.
 *
 * @param {string} status - One of PENDING | ACCEPTED | IN_PROGRESS | RESOLVED | REJECTED.
 * @returns {JSX.Element} A `<span>` element with the appropriate icon and colour class.
 */
export const getStatusBadge = (status) => {
  const s = STATUS_MAP[status] || { cls: 'badge-status', icon: 'bi-circle', label: status };
  return (
    <span className={s.cls}>
      <i className={`bi ${s.icon}`}></i> {s.label}
    </span>
  );
};
