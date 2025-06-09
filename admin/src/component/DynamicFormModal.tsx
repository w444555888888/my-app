import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Checkbox, TimePicker, Select, Button } from "antd";
import dayjs from "dayjs";

export type FieldType =
  | "input"
  | "number"
  | "textarea"
  | "select"
  | "checkboxGroup"
  | "time"
  | "custom";

export interface FormFieldConfig {
  name: string | (string | number)[];
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { label: string; value: any }[]; // for select / checkboxGroup
  customRender?: React.ReactNode;
  placeholder?: string;
}

interface DynamicFormModalProps {
  visible: boolean;
  title: string;
  fields: FormFieldConfig[];
  initialValues?: any;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}



const DynamicFormModal: React.FC<DynamicFormModalProps> = ({
  visible,
  title,
  fields,
  initialValues,
  onCancel,
  onSubmit
}) => {
  const [form] = Form.useForm();

  // 新增模式
  useEffect(() => {
    if (visible && !initialValues) {
      form.resetFields();
    }
  }, [visible]);

  // 編輯模式
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues]);

  const handleFinish = (values: any) => {
    const transformed = { ...values };
    fields.forEach(field => {
      if (field.type === "time") {
        const value = values[field.name as string];
        if (value) transformed[field.name as string] = dayjs(value).format("HH:mm");
      }
    });

    onSubmit(transformed);
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={initialValues}
      >
        {fields.map(field => {
          const rules = field.required ? [{ required: true, message: `請輸入 ${field.label}` }] : [];

          const name = field.name;
          const commonProps = {
            name,
            label: field.label,
            rules
          };

          switch (field.type) {
            case "input":
              return <Form.Item key={field.label} {...commonProps}><Input placeholder={field.placeholder} /></Form.Item>;
            case "number":
              return <Form.Item key={field.label} {...commonProps}><InputNumber style={{ width: "100%" }} placeholder={field.placeholder} /></Form.Item>;
            case "textarea":
              return <Form.Item key={field.label} {...commonProps}><Input.TextArea placeholder={field.placeholder} /></Form.Item>;
            case "time":
              return <Form.Item key={field.label} {...commonProps}><TimePicker format="HH:mm" style={{ width: "100%" }} /></Form.Item>;
            case "select":
              return (
                <Form.Item key={field.label} {...commonProps}>
                  <Select placeholder={field.placeholder}>
                    {field.options?.map(opt => (
                      <Select.Option key={opt.value} value={opt.value}>
                        {opt.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              );
            case "checkboxGroup":
              return (
                <Form.Item key={field.label} {...commonProps}>
                  <Checkbox.Group>
                    {field.options?.map(opt => (
                      <Checkbox key={opt.value} value={opt.value}>
                        {opt.label}
                      </Checkbox>
                    ))}
                  </Checkbox.Group>
                </Form.Item>
              );
            case "custom":
              return (
                <Form.Item key={field.label} {...commonProps}>
                  {field.customRender}
                </Form.Item>
              );
            default:
              return null;
          }
        })}

        <Form.Item>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DynamicFormModal;
