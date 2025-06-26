import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Checkbox, TimePicker, DatePicker, Select, Button } from "antd";
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
  readOnly?: boolean;
  timeFormat?: 'datetime' | 'timeOnly';
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


  /**
 * 將表單中的時間欄位轉換為適合後端處理的格式。
 *
 * 說明：
 * - 若欄位為 timeOnly（例如航班起飛時間 HH:mm），則轉為純時間字串格式。
 * - 若欄位為 datetime，轉為 "YYYY-MM-DDTHH:mm" 字串，**不轉換為 Date 物件或 UTC 格式**。
 *
 * 原因：
 * - 我們要傳給後端的時間是「使用者所選城市的當地時間」，
 *   而非使用者電腦的時間或 UTC。
 * - 若使用 `value.toDate()`，會根據使用者電腦時區轉成 JS Date，
 *   傳遞到後端時會自動變成 UTC（例如 "2025-08-01T04:00:00.000Z"），導致錯誤。
 * - 所以應傳送純文字時間字串給後端，例如 "2025-08-01 12:00"，由後端根據 `departureCity` 的時區自行處理。
 */
  const handleFinish = (values: any) => {
    const transformed = { ...values };
    fields.forEach(field => {
      if (field.type === "time") {
        const value = values[field.name as string];
        if (value && dayjs.isDayjs(value)) {
          if (field.timeFormat === 'timeOnly') {
            // 如果是 timeOnly，轉成 "HH:mm" 格式
            transformed[field.name as string] = value.format("HH:mm");
          } else {
            // 如果是 datetime，轉成 "YYYY-MM-DD HH:mm" 格式
            transformed[field.name as string] = value.format("YYYY-MM-DDTHH:mm");
          }
        }
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
              return <Form.Item key={key} {...commonProps}><InputNumber className="full-width" placeholder={field.placeholder} readOnly={field.readOnly} /></Form.Item>;
            case "textarea":
              return <Form.Item key={key} {...commonProps}><Input.TextArea placeholder={field.placeholder} /></Form.Item>;
            case "time":
              return (
                <Form.Item key={key} {...commonProps}>
                  {field.timeFormat === 'timeOnly' ? (
                    <TimePicker format="HH:mm" className="full-width" />
                  ) : (
                    <DatePicker
                      showTime={{ format: 'HH:mm' }}
                      format="YYYY-MM-DD HH:mm"
                      className="full-width"
                    />
                  )}
                </Form.Item>
              );
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
                <Form.Item key={key} label={field.label}>
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
