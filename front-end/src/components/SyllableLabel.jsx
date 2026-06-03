function SyllableLabel({ as: Component = 'span', children, className = '', ...props }) {
  return (
    <Component
      className={['notranslate', className].filter(Boolean).join(' ')}
      lang="zxx"
      translate="no"
      {...props}
    >
      {children}
    </Component>
  );
}

export default SyllableLabel;
