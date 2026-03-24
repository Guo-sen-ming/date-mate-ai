import styles from './ActionSheet.module.scss'

export interface ActionSheetItem {
  label: string
  icon?: React.ReactNode
  danger?: boolean
  onClick: () => void
}

interface ActionSheetProps {
  open: boolean
  onClose: () => void
  items: ActionSheetItem[]
  cancelText?: string
}

export default function ActionSheet({ open, onClose, items, cancelText = 'Cancel' }: ActionSheetProps) {
  if (!open) return null

  return (
    <div className={styles.sheet}>
      <div className={styles.backdrop} onClick={onClose} role="presentation" />
      <div className={styles.content}>
        {items.map((item, i) => (
          <button
            key={i}
            className={`${styles.item} ${item.danger ? styles.danger : ''}`}
            onClick={item.onClick}
          >
            {item.icon && <span className={styles.icon}>{item.icon}</span>}
            {item.label}
          </button>
        ))}
        <button className={styles.cancel} onClick={onClose}>
          {cancelText}
        </button>
      </div>
    </div>
  )
}
