// app/styles/defaultComponents.tsx
import React, { ReactNode } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle, 
  TouchableOpacityProps, 
  TextInputProps, 
  TextProps, 
  ViewProps, 
  StyleProp
} from 'react-native';
import { useTheme } from './themeContext';

interface CardProps extends ViewProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const Card = ({ children, style, ...props }: CardProps) => {
  const { baseStyles } = useTheme();
  
  return (
    <View style={[baseStyles.card, style]} {...props}>
      {children}
    </View>
  );
};

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
}

export const Button = ({ title, onPress, style, textStyle, disabled, loading, ...props }: ButtonProps) => {
  const { baseStyles, colors } = useTheme();
  
  return (
    <TouchableOpacity
      style={[
        baseStyles.button,
        style,
        disabled && { opacity: 0.6 },
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <Text style={[baseStyles.buttonText, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

interface SecondaryButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const SecondaryButton = ({ title, onPress, style, textStyle, ...props }: SecondaryButtonProps) => {
  const { baseStyles } = useTheme();
  
  return (
    <TouchableOpacity
      style={[baseStyles.secondaryButton, style]}
      onPress={onPress}
      {...props}
    >
      <Text style={[baseStyles.buttonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

interface OutlineButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: (event?: any) => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const OutlineButton = ({ title, onPress, style, textStyle, ...props }: OutlineButtonProps) => {
  const { baseStyles } = useTheme();
  
  return (
    <TouchableOpacity
      style={[baseStyles.outlineButton, style]}
      onPress={onPress}
      {...props}
    >
      <Text style={[baseStyles.outlineButtonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

interface InputProps extends Omit<TextInputProps, 'style'> {
  style?: StyleProp<TextStyle> | StyleProp<ViewStyle>;
}

export const Input = ({ style, ...props }: InputProps) => {
  const { baseStyles, colors } = useTheme();
  
  return (
    <TextInput
      style={[baseStyles.input, style as StyleProp<TextStyle>]}
      placeholderTextColor={colors.textSecondary}
      {...props}
    />
  );
};

interface HeadingProps extends TextProps {
  children: ReactNode;
  level?: 1 | 2 | 3 | 4;
  style?: StyleProp<TextStyle>;
}

export const Heading = ({ children, level = 1, style, ...props }: HeadingProps) => {
  const { baseStyles } = useTheme();
  
  const headingStyles = {
    1: baseStyles.h1,
    2: baseStyles.h2,
    3: baseStyles.h3,
    4: baseStyles.h4,
  };

  return (
    <Text style={[headingStyles[level], style]} {...props}>
      {children}
    </Text>
  );
};

interface ParagraphProps extends TextProps {
  children: ReactNode;
  secondary?: boolean;
  small?: boolean;
  style?: StyleProp<TextStyle>;
}

export const Paragraph = ({ children, secondary, small, style, ...props }: ParagraphProps) => {
  const { baseStyles } = useTheme();
  
  let textStyle: TextStyle = baseStyles.text;
  if (secondary) textStyle = baseStyles.textSecondary;
  if (small) textStyle = baseStyles.textSmall;

  return (
    <Text style={[textStyle, style]} {...props}>
      {children}
    </Text>
  );
};

interface DividerProps extends ViewProps {
  style?: ViewStyle;
}

export const Divider = ({ style, ...props }: DividerProps) => {
  const { baseStyles } = useTheme();
  
  return (
    <View style={[baseStyles.divider, style]} {...props} />
  );
};

interface RowProps extends ViewProps {
  children: ReactNode;
  justify?: 'between' | undefined;
  style?: ViewStyle;
}

export const Row = ({ children, justify, style, ...props }: RowProps) => {
  const { baseStyles } = useTheme();
  
  const rowStyle = justify === 'between' ? baseStyles.rowBetween : baseStyles.row;
  
  return (
    <View style={[rowStyle, style]} {...props}>
      {children}
    </View>
  );
};

type BadgeType = 'default' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps extends ViewProps {
  title: string;
  type?: BadgeType;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge = ({ title, type = 'default', style, textStyle, ...props }: BadgeProps) => {
  const { colors, baseStyles } = useTheme();
  
  const getBadgeColor = () => {
    switch (type) {
      case 'success':
        return { bg: colors.success, text: 'white' };
      case 'warning':
        return { bg: colors.warning, text: 'white' };
      case 'error':
        return { bg: colors.error, text: 'white' };
      case 'info':
        return { bg: colors.info, text: 'white' };
      default:
        return { bg: colors.primary, text: 'white' };
    }
  };

  const badgeColor = getBadgeColor();

  return (
    <View style={[baseStyles.badge, { backgroundColor: badgeColor.bg }, style]} {...props}>
      <Text style={[baseStyles.badgeText, { color: badgeColor.text }, textStyle]}>
        {title}
      </Text>
    </View>
  );
};

type Status = 'to read' | 'in progress' | 'finished' | string;

interface StatusBadgeProps {
  status: Status;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const StatusBadge = ({ status, style, textStyle }: StatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'to read':
        return { type: 'info' as BadgeType, title: 'To Read' };
      case 'in progress':
        return { type: 'warning' as BadgeType, title: 'In Progress' };
      case 'finished':
        return { type: 'success' as BadgeType, title: 'Finished' };
      default:
        return { type: 'default' as BadgeType, title: status };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge 
      title={config.title} 
      type={config.type} 
      style={style} 
      textStyle={textStyle} 
    />
  );
};

interface LoadingIndicatorProps {
  size?: 'small' | 'large';
  color?: string;
}

export const LoadingIndicator = ({ size = 'large', color }: LoadingIndicatorProps) => {
  const { colors } = useTheme();
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size={size} color={color || colors.primary} />
    </View>
  );
};

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export const EmptyState = ({ title, message, icon, action }: EmptyStateProps) => {
  const { spacing } = useTheme();
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
      {icon}
      <Heading level={3} style={{ marginTop: spacing.md, textAlign: 'center' }}>{title}</Heading>
      <Paragraph secondary style={{ textAlign: 'center', marginBottom: spacing.lg }}>
        {message}
      </Paragraph>
      {action}
    </View>
  );
};

export default {
  Card,
  Button,
  SecondaryButton,
  OutlineButton,
  Input,
  Heading,
  Paragraph,
  Divider,
  Row,
  Badge,
  StatusBadge,
  LoadingIndicator,
  EmptyState,
};