import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Checkbox, TimePicker, Select, Button } from "antd";
import type { FormInstance } from "antd/es/form";
import dayjs from "dayjs";
import './dynamicFormModal.scss';


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
  form?: FormInstance; // 外部傳入的 form 實例
}



const DynamicFormModal: React.FC<DynamicFormModalProps> = ({
  visible,
  title,
  fields,
  initialValues,
  onCancel,
  onSubmit,
  form
}) => {
  const [fallbackForm] = Form.useForm();
  const internalForm = form ?? fallbackForm;


  useEffect(() => {
    if (!visible) return;
    if (initialValues) {
      internalForm.setFieldsValue(initialValues);
    } else {
      internalForm.resetFields();
    }
  }, [visible, initialValues]);



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
        form={internalForm}
        layout="vertical"
        onFinish={handleFinish}
      >
        {fields.map(field => {
          const rules = field.required ? [{ required: true, message: `請輸入 ${field.label}` }] : [];
          const name = field.name;
          const label = field.label;
          const key = Array.isArray(name) ? name.join('.') : name;

          const commonProps = {
            name,
            label,
            rules
          };

          switch (field.type) {
            case "input":
              return <Form.Item key={key} {...commonProps}><Input placeholder={field.placeholder} /></Form.Item>;
            case "number":
              return <Form.Item key={key} {...commonProps}><InputNumber className="full-width" placeholder={field.placeholder} /></Form.Item>;
            case "textarea":
              return <Form.Item key={key} {...commonProps}><Input.TextArea placeholder={field.placeholder} /></Form.Item>;
            case "time":
              return <Form.Item key={key} {...commonProps}><TimePicker format="HH:mm" className="full-width" /></Form.Item>;
            case "select":
              return (
                <Form.Item key={key} {...commonProps}>
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
                <Form.Item key={key} {...commonProps}>
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
              if (!field.customRender) {
                console.warn(`[DynamicFormModal] customRender 為空：${field.label}`);
                return null;
              }

              return (
                <Form.Item key={key}  name={field.name} label={field.label}  rules={rules} noStyle>
                  {field.customRender}
                </Form.Item>
              );
            default:
              return null;
          }
        })}

        <Form.Item key="submit">
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DynamicFormModal;
