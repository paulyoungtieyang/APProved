import { PERMISSION_DIMENSIONS, ROLES, permissionMatrix } from "@/lib/mock-data/permission-matrix";
import styles from "./PermissionMatrix.module.css";

export function PermissionMatrix() {
  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.dimHeader}>Permission</th>
            {ROLES.map((role) => (
              <th key={role} className={styles.roleHeader}>
                {role}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERMISSION_DIMENSIONS.map((dim) => (
            <tr key={dim}>
              <td className={styles.dimCell}>{dim}</td>
              {ROLES.map((role) => (
                <td key={role} className={styles.valueCell}>
                  <span
                    className={`${styles.dot} ${
                      permissionMatrix[role][dim] ? styles.yes : styles.no
                    }`}
                    aria-label={permissionMatrix[role][dim] ? "Allowed" : "Not allowed"}
                  >
                    {permissionMatrix[role][dim] ? "✓" : "—"}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
